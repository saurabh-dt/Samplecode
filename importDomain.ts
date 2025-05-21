import path from "path";
import * as xlsx from "xlsx";
import { Domain } from "../../../database/domain/domain";
import { AttornayDashboardStatus } from "../../../database/status/attornayDashboardStatus";
import { Status } from "../../../database/status/status";
import { cleanDomainName } from "./create";
import { AttornayGenerateDocument } from "../../../database/document/attornayGenerateDocument";

// for import domain by sheeet
export const importDomainSheet = async (_: any, { input }: { input: { tabName: string } }) => {
  const { tabName } = input;
  const domainSheetHeader = [
    "Bob Visited",
    "Bob Visited",
    "Category",
    "State",
    "Company Name",
    "Domain",
    "Email",
    "Phone",
    "Street Address",
    "Secondary Address",
    "City",
    "ZIP",
    "Case Number",
  ];

  const domainTableHeader = [
    "scanDate",
    "visiteDate",
    "category",
    "state",
    "companyName",
    "domainName",
    "email",
    "phone",
    "streetAddress",
    "streetAddress2",
    "city",
    "zip",
    "domainNo",
  ];

  const additionalHeaders = ["Email Date", "Response Received", "Certified Mail Sent"];
  const additionalTableHeaders = ["emailSend", "response", "certified"];

  if (!tabName) { throw new Error("Tab name is required."); }
  const fileName = "Master Website List.xlsx";
  const filePath = path.join(__dirname, "sheet", fileName);

  // Same headers and other initial setup as before...

  let totalRecords = 0;
  let skippedDomains: { domainName: string; reason: string }[] = [];

  // Fetch status IDs dynamically
  const status = await Status.findOne({ where: { statusName: "Pending" } });
  const attorneyDashboardStatus = await AttornayDashboardStatus.findOne({ where: { statusName: tabName } });

  try {
    const workbook = xlsx.readFile(filePath);
    if (!workbook.SheetNames.includes(tabName)) {
      throw new Error(`Tab "${tabName}" not found in the file.`);
    }

    // Find the latest domain number
    // const latestDomain = await Domain.createQueryBuilder("domain").orderBy("domain.domainNo", "DESC").limit(1).getOne();
    // let latestDomainNo = latestDomain ? parseInt(latestDomain.domainNo, 10) : 60000;

    const sheet = workbook.Sheets[tabName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    const results: any[] = [];

    data.forEach((row: any) => {
      const customRow: { [key: string]: string } = {};
      domainSheetHeader.forEach((domainSheetHeader, index) => {
        const customHeader = domainTableHeader[index];
        customRow[customHeader] = row[domainSheetHeader] || "";
      });

      const additionalRow: { [key: string]: string } = {};
      additionalHeaders.forEach((additionalHeader, index) => {
        const additionalCustomHeader = additionalTableHeaders[index];
        additionalRow[additionalCustomHeader] = row[additionalHeader] || "";
      });

      results.push({ customRow, additionalRow });
    });

    for (const { customRow, additionalRow } of results) {
      const cleanedDomainName = cleanDomainName(customRow.domainName);

      // Check for duplicate domain name
      const existingDomain = await Domain.findOne({
        where: { domainName: cleanedDomainName },
      });

      if (existingDomain) {
        // Log the skipped domain and reason
        skippedDomains.push({
          domainName: cleanedDomainName,
          reason: "Duplicate domain",
        });
        continue; // Skip this record
      }

      // Domain does not exist, proceed with insertion
      let latestDomainNo = customRow.domainNo;
      const newDomain = await Domain.createQueryBuilder()
        .insert()
        .values({
          ...customRow,
          domainName: cleanedDomainName, // Save the cleaned domain name
          status: status?.id,
          attornayDashboardStatus: attorneyDashboardStatus?.id,
          domainNo: latestDomainNo.toString().padStart(5, "0"),
          scanDate: excelSerialToGoogleDate(customRow.scanDate),
          visiteDate: excelSerialToGoogleDate(customRow.visiteDate),

        })
        .returning("id")
        .execute();

      const domainId = newDomain.raw[0]?.id;
      if (!domainId) {
        throw new Error("Failed to get domain ID after insertion.");
      }

      if (additionalRow.emailSend || additionalRow.response || additionalRow.certified) {
        await AttornayGenerateDocument.createQueryBuilder()
          .insert()
          .values({
            domainId,
            emailSend: excelSerialToGoogleDate(additionalRow.emailSend),
            response: excelSerialToGoogleDate(additionalRow.response),
            certified: excelSerialToGoogleDate(additionalRow.certified),
          })
          .execute();
      }

      totalRecords++;
    }
    console.log("   skippedDomains,", skippedDomains,);

    // Return the skipped domains and their reasons
    return `Total number of records updated: ${totalRecords}`;

  } catch (error: any) {
    console.error("Error processing the sheet:", error.message);
    throw new Error(`Error processing the sheet: ${error.message}`);
  }
};
const excelSerialToGoogleDate = (serialNumber: any) => {
  const startDate = new Date(1900, 0, 1); // Jan 1, 1900
  startDate.setDate(startDate.getDate() + serialNumber - 2);

  // Format the date in MM/DD/YYYY format
  const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
  const day = startDate.getDate().toString().padStart(2, '0');
  const year = startDate.getFullYear();

  return `${month}/${day}/${year}`;
};
