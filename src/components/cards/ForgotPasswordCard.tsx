import React from 'react';
import { Card, Input, Form, Button } from 'antd';

type ForgotPasswordCardProps = {
  className?: string;
  description: JSX.Element;
};

const ForgotPasswordCard = ({
  className,
  description
}: ForgotPasswordCardProps): JSX.Element => {
  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetPassword = async (email: string): Promise<void> => {
    throw new Error('Not implemented');
  };

  return (
    <Card bordered={false} title="Forgot your password?" className={className}>
      <Card.Meta description={description} />
      <Form
        form={form}
        layout="vertical"
        onFinish={resetPassword}
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
          <Button type="primary" htmlType="submit">
            Reset password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ForgotPasswordCard;
