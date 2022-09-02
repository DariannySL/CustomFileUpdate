public without sharing class FileUploadController {
    
    @AuraEnabled
    public static string uploadFiles(String recordId, String fileData){
        try {
            if(String.isNotBlank(fileData)) {
                List<FileDataWP> files = (List<FileDataWP>) JSON.deserialize(fileData, List<FileDataWP>.class);

                List<ContentVersion> contentVersions  = new List<ContentVersion>();
                for(FileDataWP file : files) {
                    ContentVersion contentVersion = new ContentVersion();
                    contentVersion.ContentLocation = 'S';
                    contentVersion.VersionData = EncodingUtil.base64Decode(file.fileContent);
                    contentVersion.Title = file.fileName;
                    contentVersion.PathOnClient = file.fileName;
                    contentVersions.add(contentVersion);
                }
                Insert contentVersions;

                List<ContentDocumentLink> documentLinks = new List<ContentDocumentLink>();
                for(contentVersion contentVersion : [SELECT ContentDocumentId FROM ContentVersion Where Id =: contentVersions]) {
                    ContentDocumentLink documentLink = new ContentDocumentLink();
                    documentLink.LinkedEntityId = recordId;
                    documentLink.ContentDocumentId = contentVersion.ContentDocumentId;
                    documentLink.Visibility = 'AllUsers';
                    documentLink.shareType = 'V'; // Viewer
                    documentLinks.add(documentLink);
                }
                Insert documentLinks;
            } else {
                return 'The record ID is blank';
            }

            return 'Success';

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class FileDataWP {
        public String fileName;
        public String fileContent;
    }
}
