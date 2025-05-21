import { Domain } from "../../../database/domain/domain";
import { AttornayDashboardStatus } from "../../../database/status/attornayDashboardStatus";
import { Status } from "../../../database/status/status";


export const createDomain = async (
  _: null,
  { input }: { input: Domain[] },
): Promise<Domain[]> => {

  let results: Domain[] = [];

  const inputDomains = input.map(c => cleanDomainName(c.domainName));

  // Default role Id if you want to dynamically pass from FE and add in where condition
  const statusId = (await Status.findOne({ where: { statusConstraint: "PENDING" } }))?.id;
  const dashboardStatusId = (await AttornayDashboardStatus.findOne({ where: { statusConstraint: "Unsent" } }))?.id;

  // Find existing domains with the same domain names
  const existingDomain = await Domain.createQueryBuilder("domain")
    .where("domain.domainName IN (:...domains)", { domains: inputDomains })
    .getMany();

  // Find the latest domain number
  const latestDomain = await Domain.createQueryBuilder("domain").orderBy("domain.domainNo", "DESC").limit(1).getOne();

  // Get the domains of the existing domains
  const existingDomains = existingDomain.map(c => cleanDomainName(c.domainName));

  // Determine the starting point for the domain number
  let latestDomainNo = latestDomain ? parseInt(latestDomain.domainNo, 10) : 60000;

  // Filter out domains that already exist
  const newDomains = input
    .filter(c => !existingDomains.includes(cleanDomainName(c.domainName)))
    .map(domain => {
      latestDomainNo += 1; // Increment latestDomainNo for each new domain
      return {
        ...domain,
        domainName: cleanDomainName(domain.domainName),
        domainNo: latestDomainNo.toString().padStart(5, "0"), // Ensure domainNo is always 5 digits
        status: statusId,
        attornayDashboardStatus: dashboardStatusId
      };
    });

  if (!newDomains.length) {
    throw new Error("All domains are already in the system.");
  }

  // Insert new domains into the database
  await Domain.createQueryBuilder()
    .insert()
    .values(newDomains)
    .output("*")
    .execute()
    .then((response) => {
      if (!Array.isArray(response.raw) || response.raw.length === 0) {
        throw new Error("Failed to insert data.");
      }
      results = response.raw;
    });

  return results;
};

//  Helper function to clean and format the domain name
export const cleanDomainName = (domainName: string): string => {
  // Remove http://, https://, or any variation of those protocols
  let cleanedDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/i, '');
  // Add 'www.' if it doesn't already start with it
  if (!cleanedDomain.startsWith('www.')) {
    cleanedDomain = `www.${cleanedDomain}`;
  }

  return cleanedDomain;
};


