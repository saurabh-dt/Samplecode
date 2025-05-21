import { AuditVersion } from '../../../database/document/auditVersion';
import { GraphQLContext } from "../../utility/graphql";
import { deleteDriveDocument } from "../../utility/google/doc/delete"
export const deleteAuditVersion = async (
  _: any,
  { auditfileId }: { auditfileId: string },
  { userId }: GraphQLContext
) => {
  try {
    // Attempt to delete the document from Google Drive
    await deleteDriveDocument(auditfileId);

    // Then, delete records from AuditVersion based on auditfileId
    const result = await AuditVersion.createQueryBuilder()
      .delete()
      .where({ auditfileId })
      .execute();

    // Check if rows were affected
    if (result.affected && result.affected > 0) {
      return `Successfully deleted ${result.affected} record(s) and corresponding Google Drive document.`;
    } else {
      throw new Error(
        `No records found with the provided auditfileId: ${auditfileId}, but the Drive document was deleted.`
      );
    }
  } catch (error: any) {
    throw new Error(`Failed to delete document from drive: ${error.message}`);
  }
};
