import React, { useState } from 'react';
import { Card, Input, Form, Button, Alert, notification } from 'antd';
import { AxiosError } from 'axios';
import { AuthError, Credentials } from './types';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';

type SignUpCardProps = {
  className?: string;
  description: JSX.Element;
};

const SignUpCard = ({ className, description }: SignUpCardProps): JSX.Element => {
  const [form] = Form.useForm();
  const loader = useLoader();
  const [error, setError] = useState<AuthError | null>(null);
  const user = useUser();

  const createAccount = async (credentials: Credentials): Promise<void> => {
    const email = credentials.email.toLowerCase().trim();
    const { nid, password } = credentials;

    loader.startLoading();
    setError(null);

    try {
      await user.createAccount({ email, nid, password });
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      const errorObject: AuthError = {
        title: '',
        message: ''
      };

      switch (status) {
        case 400:
          errorObject.title = 'Invalid Email';
          errorObject.message = 'Please enter a valid email address and try again.';
          break;
        case 401:
          errorObject.title = 'Invalid Credentials';
          errorObject.message =
            'You NID or password was incorrect. Check your credentials and try again.';
          break;
        case 409:
          errorObject.title = 'Email or NID Taken';
          errorObject.message =
            'This email address or NID is already in use by another account.';
          break;
        default:
          errorObject.title = 'Server Error';
          errorObject.message = 'An unexpected error occurred, please try again.';
      }

      setError(errorObject);
      loader.stopLoading();
      return;
    }

    loader.stopLoading();

    notification.success({
      duration: 5,
      message: 'Account Created',
      description: 'Check your email for a link to verify your account.'
    });
  };

  return (
    <Card bordered={false} title="Sign Up With Your Email" className={className}>
      <Card.Meta description={description} />
      <Form
        form={form}
        layout="vertical"
        onFinish={createAccount}
        requiredMark={false}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      >
        <Form.Item
          label="Email"
          name="email"
          required
          rules={[
            {
              message: 'An email is required',
              required: true
            }
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="NID"
          name="nid"
          rules={[
            {
              required: true,
              message: 'Your NID is required'
            }
          ]}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          required
          rules={[
            {
              required: true,
              message: 'Your password is required'
            }
          ]}
        >
          <Input.Password />
        </Form.Item>
        {error && (
          <Alert
            closable
            onClose={() => setError(null)}
            type="error"
            message={error.title}
            description={error.message}
          />
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={loader.isLoading}>
            Create account
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpCard;
