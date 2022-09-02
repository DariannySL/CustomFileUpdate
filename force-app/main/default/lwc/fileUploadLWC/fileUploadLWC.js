import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFiles from '@salesforce/apex/FileUploadController.uploadFiles'
const MAX_FILE_SIZE = 2097152;

export default class FileUploadLWC extends LightningElement {

    @api recordId;
    @track filesData = [];
    showSpinner = false;

    handleFilesUpload(event) {
        if(event.target.files.length > 0) {
            for(let i = 0; i < event.target.files.length; i++) {
                if(event.target.files[i].size > MAX_FILE_SIZE) {
                    this.showToast('Error', 'error', 'The file size exceeded the upload size limit');
                    return;
                }

                let file = event.target.files[i];
                let reader = new FileReader();

                reader.onload = e => {
                    var fileContent = reader.result.split(',')[1];
                    this.filesData.push({'fileName':file.name, 'fileContent':fileContent});
                };

                reader.readAsDataURL(file);
            }
        }
    }

    uploadFiles() {
        if(this.filesData == [] || this.filesData.length == 0) {
            this.showToast('Error', 'error', 'Please select a file to upload');
            return;
        }
        this.showSpinner = true;

        uploadFiles({
            recordId : this.recordId,
            fileData : JSON.stringify(this.filesData)
        }).then(result => {
            if(result == 'Success') {
                this.filesData = [];
                this.showToast('Success', 'success', 'Files Uploaded Successfully');
            } else {
                this.showToast('Error :<', 'error', result);
            }
        }).catch(e => {
            if(e && e.body && e.body.message) {
                this.showToast('Error :c', 'error', e.body.message);
            }
        }).finally(() => this.showSpinner = false );
    }

    removeReceiptImage(event) {
        var index = event.currentTarget.dataset.id;
        this.filesData.splice(index, 1);
    }
 
    showToast(title, variant, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message,
            })
        );
    }
}