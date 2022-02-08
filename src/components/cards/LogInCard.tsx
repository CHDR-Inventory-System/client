import React, { useState } from 'react';
import { Card, Input, Form, Button, Alert } from 'antd';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthError, Credentials } from './types';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';

type LogInCardProps = {
  className?: string;
  description: JSX.Element;
};

const LogInCard = ({ className, description }: LogInCardProps): JSX.Element => {
  const [form] = Form.useForm();
  const [error, setError] = useState<AuthError | null>(null);
  const loader = useLoader();
  const user = useUser();
  const navigate = useNavigate();

  const logIn = async (credentials: Omit<Credentials, 'email'>) => {
    const { nid, password } = credentials;

    loader.startLoading();

    try {
      await user.login(nid, password);

      loader.stopLoading();

      navigate('/');
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      loader.stopLoading();

      if (status === 401) {
        setError({
          title: 'Invalid Credentials',
          message: 'Make sure your NID and password are correct and try again.'
        });
      } else {
        setError({
          title: 'Server Error',
          message: 'An unexpected error occurred, please try again.'
        });
      }
    }
  };

  return (
    <Card bordered={false} title="Log In With Your NID" className={className}>
      <Card.Meta description={description} />
      <Form
        form={form}
        layout="vertical"
        onFinish={logIn}
        requiredMark={false}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      >
        <Form.Item
          label="NID"
          name="nid"
          rules={[
            {
              required: true,
              message: 'An NID is required'
            }
          ]}
        >
          <Input type="text" enterKeyHint="go" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'A password is required'
            }
          ]}
        >
          <Input.Password enterKeyHint="go" />
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
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LogInCard;
