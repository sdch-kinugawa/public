import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ConfirmationModal extends LightningModal {

    @api targetRow;

    handleOkay() {
        this.close('okay');
    }

    handleCancel() {
        this.close('cancel');
    }

}