import React, { useEffect } from 'react';
import { Card, Input, Form, Button, notification } from 'antd';
import { CardProps } from './types';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';

const ResetPasswordCard = ({ className, description }: CardProps): JSX.Element => {
  const [form] = Form.useForm();
  const loader = useLoader();
  const user = useUser();

  const sendPasswordResetEmail = async (email: string) => {
    loader.startLoading();

    try {
      await user.sendPasswordResetEmail(email);

      notification.success({
        key: 'reset-success',
        message: 'Email Sent',
        description: (
          <p>
            An email was sent to <b>{email}</b>. Check your inbox for a link to reset your
            password.
          </p>
        )
      });
    } catch {
      notification.error({
        key: 'reset-error',
        message: 'Error Resetting Password',
        description: 'An unexpected error occurred, please try again.'
      });
    }

    loader.stopLoading();
  };

  useEffect(() => {
    document.title = 'CHDR Inventory - Reset Password';
  }, []);

  return (
    <Card bordered={false} title="Reset Password" className={className}>
      <Card.Meta description={description} />
      <Form
        form={form}
        layout="vertical"
        onFinish={values => sendPasswordResetEmail(values.email)}
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
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={loader.isLoading}
            loading={loader.isLoading}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ResetPasswordCard;
