import React from 'react';
import { Card, Input, Form, Button, notification } from 'antd';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Credentials } from './types';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';

type LogInCardProps = {
  className?: string;
  description: JSX.Element;
};

const LogInCard = ({ className, description }: LogInCardProps): JSX.Element => {
  const [form] = Form.useForm();
  const loader = useLoader();
  const user = useUser();
  const navigate = useNavigate();

  const logIn = async (credentials: Pick<Credentials, 'email' | 'password'>) => {
    const { email, password } = credentials;

    loader.startLoading();

    try {
      await user.login(email, password);

      loader.stopLoading();

      navigate('/');
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      loader.stopLoading();

      if (status === 401) {
        notification.error({
          key: 'login-error',
          message: 'Invalid Credentials',
          description: 'Make sure your email and password are correct and try again.'
        });
      } else {
        notification.error({
          duration: 0,
          key: 'login-error',
          message: 'Error Logging In',
          description: 'An unexpected error occurred, please try again.'
        });
      }
    }
  };

  return (
    <Card bordered={false} title="Log In With Your Email" className={className}>
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
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'An email is required'
            }
          ]}
        >
          <Input type="email" enterKeyHint="go" />
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
