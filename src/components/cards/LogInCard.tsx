import React from 'react';
import { Card, Input, Form, Button } from 'antd';

type Credentials = {
  email: string;
  password: string;
};

type LogInCardProps = {
  className?: string;
  description: JSX.Element;
};

const LogInCard = ({ className, description }: LogInCardProps): JSX.Element => {
  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const logIn = async (credentials: Credentials): Promise<void> => {
    throw new Error('Not implemented');
  };

  return (
    <Card bordered={false} title="Log In" className={className}>
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
          <Button type="primary" htmlType="submit">
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LogInCard;
