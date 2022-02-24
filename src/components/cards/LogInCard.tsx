import React, { useState } from 'react';
import { Card, Input, Form, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CardProps, Credentials } from './types';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';
import VerifyEmailModal from '../modals/VerifyEmailModal';
import APIError from '../../util/APIError';

const LogInCard = ({ className, description }: CardProps): JSX.Element => {
  const [form] = Form.useForm();
  const [isVerifyModalVisible, setVerifyModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const loader = useLoader();
  const user = useUser();
  const navigate = useNavigate();

  const logIn = async (credentials: Pick<Credentials, 'email' | 'password'>) => {
    const { email, password } = credentials;

    setUserEmail(email);
    loader.startLoading();

    try {
      const response = await user.login(email, password);

      if (!response.verified) {
        setVerifyModalVisible(true);
        loader.stopLoading();
        return;
      }

      loader.stopLoading();

      navigate('/');
    } catch (err) {
      const { status } = err as APIError;
      loader.stopLoading();

      if (status === 401) {
        notification.error({
          key: 'login-error',
          message: 'Invalid Credentials',
          description: 'Make sure your email and password are correct and try again.'
        });
      } else {
        notification.error({
          key: 'login-error',
          message: 'Error Logging In',
          description: 'An unexpected error occurred, please try again.'
        });
      }
    }
  };

  return (
    <Card bordered={false} title="Log In With Your Email" className={className}>
      <VerifyEmailModal
        email={userEmail}
        visible={isVerifyModalVisible}
        onClose={() => setVerifyModalVisible(false)}
      />
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
          <Button
            type="primary"
            htmlType="submit"
            disabled={loader.isLoading}
            loading={loader.isLoading}
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LogInCard;
