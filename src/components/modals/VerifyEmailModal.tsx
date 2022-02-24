import '../../scss/verify-email-modal.scss';
import { Modal, notification } from 'antd';
import React from 'react';
import useLoader from '../../hooks/loading';
import useUser from '../../hooks/user';

type VerifyEmailModalProps = {
  visible: boolean;
  onClose: () => void;
  email: string;
};

const VerifyEmailModal = ({
  visible,
  onClose,
  email
}: VerifyEmailModalProps): JSX.Element => {
  const loader = useLoader();
  const user = useUser();

  const resendVerificationEmail = async () => {
    loader.startLoading();

    try {
      await user.resendVerificationEmail(email);
      notification.success({
        description: (
          <p>
            An email was sent to <b>{email}</b>. Check your inbox for a link to verify
            your email.
          </p>
        ),
        message: 'Email Sent'
      });

      onClose();
    } catch {
      notification.error({
        description: 'An unexpected error occurred, please try again',
        message: 'Error Sending Email'
      });
    }

    loader.stopLoading();
  };

  return (
    <Modal
      destroyOnClose
      centered
      className="verify-email-modal"
      title="Verify Your Email"
      visible={visible}
      onCancel={onClose}
      okButtonProps={{
        loading: loader.isLoading,
        disabled: loader.isLoading
      }}
      onOk={resendVerificationEmail}
      okText="Resend"
    >
      Looks like you haven&apos;t verified your email yet. Check your inbox or click
      resend if you haven&apos;t receive a verification link, then try logging in again.
    </Modal>
  );
};

export default VerifyEmailModal;
