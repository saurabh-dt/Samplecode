
import { In } from "typeorm";
import { bulkUpdateDomain } from "../../../types/subdomain";
import { AttornayGenerateDocument } from "../../../database/document/attornayGenerateDocument";
import { updateAttornayDashboardStatus } from "./updateDomain";
import { AttornayDashboardStatus } from "../../../database/status/attornayDashboardStatus";
import { Domain } from "../../../database/domain/domain";
import { moveFolder } from "../../utility/google/driveFolder/create";

// update settement by id
export const bulkDomainUpdate = async (
  _: null,
  { input }: { input: bulkUpdateDomain },
) => {
  const { ids, status, certifiedDate } = input;
  if (status != null) {
    for (const id of ids) {
      await updateAttornayDashboardStatus(id, status);
      const newFolderId = (await AttornayDashboardStatus.findOne({ where: { id: status } }))?.driveFolderId;
      const oldFolderId = (await Domain.findOne({ where: { id } }))?.driveFolderId;
      if (newFolderId && oldFolderId) {
        const color = (await AttornayDashboardStatus.findOne({ where: { id: status } }))?.color!;
        await moveFolder(oldFolderId, newFolderId, color);
      }

    }
  }
  if (certifiedDate != null) {
    // Find existing records in AttornayGenerateDocument
    const existingDocs = await AttornayGenerateDocument.find({
      where: { domainId: In(ids) },
    });

    const existingDomainIds = new Set(existingDocs.map(doc => doc.domainId));

    // Update existing records
    await AttornayGenerateDocument.update(
      { domainId: In(Array.from(existingDomainIds)) },
      { certified: certifiedDate }
    );

    // Create new records for domains that don't exist
    const newDomainIds = ids.filter(id => !existingDomainIds.has(id));
    const newRecords = newDomainIds.map(id =>
      AttornayGenerateDocument.create({
        domainId: id,
        certified: certifiedDate,
      })
    );

    if (newRecords.length > 0) {
      await AttornayGenerateDocument.save(newRecords);
    }
  }
  return 'Updated successfully'
};
