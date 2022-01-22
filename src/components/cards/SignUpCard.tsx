import React, { useState } from 'react';
import { Card, Input, Form, Button, Alert } from 'antd';
import { AxiosError } from 'axios';
import { AuthError, Credentials } from './types';
import API from '../../util/API';

type SignUpCardProps = {
  className?: string;
  description: JSX.Element;
};

const SignUpCard = ({ className, description }: SignUpCardProps): JSX.Element => {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const createAccount = async (credentials: Credentials): Promise<void> => {
    const email = credentials.email.toLowerCase().trim();
    const { nid, password } = credentials;

    setLoading(true);
    setError(null);

    API.createAccount({ nid, password, email })
      .then(() => new Error('Not Implemented'))
      .catch((err: AxiosError) => {
        const errorObject: AuthError = {
          title: 'Server Error',
          message: 'An unexpected error occurred, please try again.'
        };

        switch (err.response?.status) {
          case 404:
            errorObject.title = 'Invalid Credentials';
            errorObject.message =
              'Make sure your NID and password are correct and try again.';
            break;
          case 409:
            errorObject.title = 'Email Taken';
            errorObject.message =
              'This email address is already in use by another account.';
            break;
          default:
            break;
        }

        setError(errorObject);
      })
      .finally(() => setLoading(false));
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
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            Create account
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpCard;
