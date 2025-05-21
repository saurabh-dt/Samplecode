
import { Domain } from "../../../database/domain/domain";
import { AuditVersion } from '../../../database/document/auditVersion';
import { UpdateUserJourneyInput } from "../../../types/subdomain";
import { trimUrl, getFormattedDatehms, getFormattedDate, convertTimestampToDate, capitalizeFirstLetter } from "../../utility/commonMethod";
import { createDocument, moveDocumentToFolder, updateGoogleDoc } from "../../utility/google/doc/createDocument";

// create user Joureny
export const createUserJoureny = async (
  _: unknown,
  { input }: { input: UpdateUserJourneyInput }
): Promise<string> => {
  const { id, userJourney, date } = input;
  const formattedDate = getFormattedDate(date);
  // Fetch the domain details
  const domain = await Domain.findOne({ where: { id } });
  if (!domain) throw new Error("Domain not found.");
  if (!domain?.driveFolderId) {
    throw new Error("Please generate Google folder before creating the user journey.");
  }
  const domainName = trimUrl(domain.domainName);
  const capitalDomain = capitalizeFirstLetter(domainName);
  const baseFileName = `User Journey Description - ${capitalDomain}-${formattedDate}`;

  // Check for existing user journeys for the same domainId
  const existingFiles = await AuditVersion.find({
    where: { domainId: domain.id, auditType: 'Journey' },
  });

  let versionSuffix = '';
  if (existingFiles.length > 0) {
    // Extract version numbers from all existing files
    const versionNumbers = existingFiles.map(file => {
      const match = file.fileName.match(/-v(\d+)$/); // Match the version suffix
      return match ? parseInt(match[1], 10) : 1; // Default to 1 if no version found
    });

    // Increment the highest version number
    const highestVersion = Math.max(...versionNumbers);
    versionSuffix = `-v${highestVersion + 1}`;
  }

  // Construct the file name with or without "Retest" based on existing files
  const userJourneyName = existingFiles.length === 0
    ? baseFileName
    : `Retest-${baseFileName}${versionSuffix}`;

  // Create the document in Google Drive
  const documentId = await createDocument(userJourneyName, domain.driveFolderId);
  const userJourneyDoc = await moveDocumentToFolder(documentId, domain.driveFolderId)!;
  await updateGoogleDoc(userJourneyDoc.id, userJourney);

  // Save the new document's details in the database
  await AuditVersion.insert({
    domainId: id,
    auditfileId: userJourneyDoc.id,
    auditfileLink: userJourneyDoc.webViewLink,
    auditType: 'Journey',
    date,
    userJourney: userJourney,
    fileName: userJourneyName, // Save the generated file name with versioning
  });

  return "User journey added successfully.";
};


// update user-jounrney
export const updateUserJoureny = async (
  _: unknown,
  { input }: { input: UpdateUserJourneyInput }
): Promise<string> => {
  const { id, userJourney, date } = input;
  const domain = await Domain.findOne({ where: { id } });
  if (!domain) throw new Error("Domain not found.");
  if (!domain?.driveFolderId) {
    throw new Error("Please generate google folder before creating user Journey.");
  }
  const convertDate = convertTimestampToDate(date);
  const useJoneryName = (`User Journey Description`) + ' - ' + trimUrl(domain.domainName) + '-' + convertDate;
  const documentId = await createDocument(useJoneryName, domain.driveFolderId);
  const userJourneyDoc = await moveDocumentToFolder(documentId, domain.driveFolderId)!;
  await updateGoogleDoc(userJourneyDoc.id, userJourney);
  //await Domain.update(id, { userJourneyDocId: userJourneyDoc.id, userJourneyLink: userJourneyDoc.webViewLink, userJourney });
  await AuditVersion.insert({ domainId: id, auditfileId: userJourneyDoc.id, auditfileLink: userJourneyDoc.webViewLink, auditType: 'Journey', userJourney: userJourney });
  //}
  return "User journey added successfully.";
};

// New user-journey
export const newUserJourney = async (
  _: unknown,
  { input }: { input: UpdateUserJourneyInput }
): Promise<string> => {
  const { id, userJourney } = input;
  const domain = await Domain.findOne({ where: { id } });
  if (!domain) throw new Error("Domain not found.");
  if (!domain?.driveFolderId) {
    throw new Error("Please generate google folder before creating user Journey.");
  }
  const date = getFormattedDatehms(); // Generates a timestamp in ISO format
  const useJoneryName = (`User Journey Description`) + ' - ' + trimUrl(domain.domainName) + '-' + date;
  const documentId = await createDocument(useJoneryName, domain.driveFolderId);
  const userJourneyDoc = await moveDocumentToFolder(documentId, domain.driveFolderId)!;
  await updateGoogleDoc(userJourneyDoc.id, userJourney);
  await AuditVersion.insert({ domainId: id, auditfileId: userJourneyDoc.id, auditfileLink: userJourneyDoc.webViewLink, auditType: 'Journey', userJourney: userJourney });
  return "New user journey created successfully.";
};




