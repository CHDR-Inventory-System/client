import '../../scss/edit-account-modal.scss';
import React, { useEffect, useState } from 'react';
import { Input, Modal, Form, Button, notification } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { BaseModalProps } from './base-modal-props';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';
import APIError from '../../util/APIError';

const schema = yup.object({
  firstName: yup.string().trim().required('A first name is required'),
  lastName: yup.string().trim().required('A last name is required')
});

type FormValues = {
  firstName: string;
  lastName: string;
};

const EditAccountModal = ({ onClose, visible }: BaseModalProps): JSX.Element => {
  const user = useUser();
  const loader = useLoader();
  const [dirty, setDirty] = useState(false);
  const [form] = Form.useForm();
  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      firstName: user.state.firstName,
      lastName: user.state.lastName
    },
    validateOnChange: false,
    onSubmit: values => updateName(values)
  });

  const updateName = async (values: FormValues) => {
    loader.startLoading();

    try {
      const { firstName, lastName } = await schema.validate(values, {
        abortEarly: false
      });

      await user.updateName(firstName, lastName);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          err.inner.map(fieldError => ({
            name: fieldError.path || '',
            errors: [fieldError.message]
          }))
        );
      }

      if (err instanceof APIError) {
        notification.error({
          key: 'update-name-error',
          message: 'Error Updating Name',
          description: 'An error occurred while updating your name, please try again.'
        });
      }
    }

    loader.stopLoading();
  };

  const updateEmail = async () => {
    loader.startLoading();

    try {
      await user.sendUpdateEmail();

      notification.success({
        key: 'email-update-success',
        message: 'Email Update Requested',
        description: (
          <span>
            An email was sent to <b>{user.state.email}</b>. Check your inbox for a link to
            update your email.
          </span>
        )
      });
    } catch {
      notification.error({
        key: 'email-update-error',
        message: "Couldn't Request Update",
        description: 'An error occurred while updating your email, please try again.'
      });
    }

    loader.stopLoading();
  };

  const resetPassword = async () => {
    loader.startLoading();

    try {
      await user.sendPasswordResetEmail(user.state.email);
      notification.success({
        key: 'password-reset-success',
        message: 'Email Sent',
        description: (
          <span>
            An email was sent to <b>{user.state.email}</b>. Check your inbox for a link to
            reset your password.
          </span>
        )
      });
    } catch {
      notification.error({
        key: 'password-reset-error',
        message: 'Error Changing Password',
        description:
          'An error occurred while requesting a password change, please try again.'
      });
    }

    loader.stopLoading();
  };

  const onFormChange = () => {
    const firstName = form.getFieldValue('firstName').trim();
    const lastName = form.getFieldValue('lastName').trim();

    setDirty(firstName !== user.state.firstName || lastName !== user.state.lastName);
  };

  useEffect(() => {
    form.resetFields();
  }, [visible]);

  return (
    <Modal
      centered
      destroyOnClose
      visible={visible}
      onCancel={onClose}
      title="Your Account"
      className="edit-account-modal"
      okText="Save Changes"
      cancelText="Close"
      onOk={() => formik.submitForm()}
      okButtonProps={{
        loading: loader.isLoading,
        disabled:
          loader.isLoading ||
          !dirty ||
          !formik.values.firstName.trim() ||
          !formik.values.lastName.trim()
      }}
    >
      <p className="welcome-message">Hello, {user.state.fullName}!</p>
      <Form
        form={form}
        layout="vertical"
        initialValues={formik.initialValues}
        onChange={onFormChange}
      >
        <Form.Item label="First Name" name="firstName">
          <Input type="text" onChange={formik.handleChange('firstName')} />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName">
          <Input type="text" onChange={formik.handleChange('lastName')} />
        </Form.Item>
        <Form.Item help="You'll receive an email with a link to update your email">
          <Button
            type="primary"
            className="form-action-button"
            disabled={loader.isLoading}
            onClick={updateEmail}
          >
            Change Your Email
          </Button>
        </Form.Item>
        <Form.Item help="You'll receive an email with a link to change your password">
          <Button
            type="primary"
            className="form-action-button"
            disabled={loader.isLoading}
            onClick={resetPassword}
          >
            Change Your Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAccountModal;
