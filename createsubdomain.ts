import { Domain } from "../../../database/domain/domain";
import { SubDomains } from "../../../database/domain/subdomain";
import { SubDomainInput } from "../../../types/subdomain";
import { trimObjectValues, trimUrl, validateFields } from "../../utility/commonMethod";
import { createFolder } from "../../utility/google/driveFolder/create";

// create sub folder
export const createSubDomain = async (_: null, { input }: { input: SubDomainInput }) => {
  try {
    const createdSubDomains = [];
    for (const subDomainName of input.subDomainName) {
      const subDomainInput = { domainId: input.domainId, subDomainName };

      const trimmedObj = trimObjectValues(subDomainInput as any);
      const errors = validateFields(trimmedObj);
      if (errors) { throw new Error(errors as any); }
      createSubDomain
      const sanitizedInput: Partial<any> = { domainId: trimmedObj.domainId, subDomainName: trimmedObj.subDomainName };

      const duplicateCount = await SubDomains.findOne({ where: { domainId: trimmedObj.domainId, subDomainName } });
      const domain = await Domain.findOne({ where: { id: trimmedObj.domainId } });
      if (!domain?.driveFolderId) {
        throw new Error("Please generate google folder before creating the subdomain.");
      }
      const driveFolder = domain?.scanReportDriveId!;

      if (duplicateCount != null) {
        throw new Error(`A record with the name '${subDomainName}' already exists.`);
      }

      const subDomain = await insertSubDomain(sanitizedInput)
      createdSubDomains.push(subDomain);
      await createFoldersForSubdomains(createdSubDomains, driveFolder);
    }

    return createdSubDomains;
  } catch (error) {
    throw error; // Re-throw the error to be handled by GraphQL or higher-level error handling
  }
};


export async function insertSubDomain(sanitizedInput: any) {

  return await SubDomains.createQueryBuilder()
    .insert()
    .values(sanitizedInput)
    .output("*")
    .execute()
    .then((response) => {
      if (!Array.isArray(response.raw) || response.raw.length === 0) {
        throw new Error("Failed to create subdomain");
      }
      return response.raw[0];
    });
}

// create sub-folder on google doc
export async function createFoldersForSubdomains(
  createdSubDomains: SubDomains[],
  parentFolderId: string
): Promise<void> {
  for (const subdomain of createdSubDomains) {
    const domainName = trimUrl(subdomain.subDomainName);
    const folder = await createFolder(domainName, parentFolderId);
    if (folder instanceof Error) {
      continue;
    }
    const driveFolderId = folder?.id;
    await SubDomains.update({ id: subdomain.id }, { driveFolderId });

  }
}
