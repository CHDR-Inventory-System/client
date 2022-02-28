import '../../scss/edit-account-modal.scss';
import React, { useEffect, useState } from 'react';
import { Input, Modal, Form, Button, notification } from 'antd';
import { useFormik } from 'formik';
import { ArgsProps } from 'antd/lib/notification';
import * as yup from 'yup';
import { BaseModalProps } from './base-modal-props';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';
import APIError from '../../util/APIError';

const accountSchema = yup.object({
  email: yup.string().trim().required('An email is required'),
  password: yup.string().required('You need to confirm your password')
});

type FormValues = {
  email: string;
  password: string;
};

const EditAccountModal = ({ onClose, visible }: BaseModalProps): JSX.Element => {
  const user = useUser();
  const loader = useLoader();
  const [dirty, setDirty] = useState(false);
  const [form] = Form.useForm();
  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      email: '',
      password: ''
    },
    validateOnChange: false,
    onSubmit: values => updateEmail(values)
  });

  const updateEmail = async (values: FormValues) => {
    const email = values.email.trim().toLowerCase();

    if (!dirty || email === user.state.email.toLowerCase()) {
      return;
    }

    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(values).map(key => ({
        name: key,
        errors: []
      }))
    );

    try {
      const parsedValues = await accountSchema.validate(values, { abortEarly: false });
      await user.sendUpdateEmail(parsedValues.email, parsedValues.password);

      notification.success({
        key: 'email-update-success',
        message: 'Email Update Requested',
        description: (
          <span>
            An email was sent to <b>{email}</b>. Check your inbox for a link to verify
            your account.
          </span>
        )
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          err.inner.map(error => ({
            name: error.path || '',
            errors: [error.message]
          }))
        );
      }

      if (err instanceof APIError) {
        const { status } = err;
        const notificationProps: Partial<ArgsProps> = {
          message: status === 401 ? 'Invalid Credentials' : 'Error Updating',
          description:
            status === 401
              ? 'Invalid password. Make sure your password is correct and try again.'
              : 'An error occurred while updating your email, please try again.'
        };

        notification.error({
          key: 'email-update-error',
          message: notificationProps.message,
          description: notificationProps.description
        });
      }
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

  const onFormChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    const target = event.nativeEvent.target as HTMLInputElement;

    if (target.type === 'email') {
      setDirty(target.value.toLowerCase().trim() !== user.state.email.toLowerCase());
    }
  };

  useEffect(() => {
    form.resetFields();
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      visible={visible}
      onCancel={onClose}
      title="Your Account"
      className="edit-account-modal"
      okText="Save Changes"
      onOk={() => formik.submitForm()}
      okButtonProps={{
        loading: loader.isLoading,
        disabled:
          loader.isLoading || !dirty || !formik.values.email || !formik.values.password
      }}
    >
      <p className="welcome-message">Hello, {user.state.fullName}!</p>
      <Form
        form={form}
        layout="vertical"
        initialValues={formik.initialValues}
        onChange={onFormChange}
      >
        <Form.Item label="Update Email" name="email">
          <Input
            type="email"
            onChange={formik.handleChange('email')}
            placeholder="Enter a new email address"
          />
        </Form.Item>
        <Form.Item
          label="Confirm Your Password"
          name="password"
          help={
            form.getFieldError('email')[0] ||
            "You'll need to confirm your password before you update your email."
          }
        >
          <Input.Password onChange={formik.handleChange('password')} />
        </Form.Item>
        <Form.Item help="You'll receive an email with a link to change your password">
          <Button
            type="primary"
            className="change-password-button"
            disabled={loader.isLoading}
            loading={loader.isLoading}
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
