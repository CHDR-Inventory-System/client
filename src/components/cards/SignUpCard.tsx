import React from 'react';
import { Card, Input, Form, Button } from 'antd';

type Credentials = {
  nid: string;
  email: string;
  password: string;
};

type SignUpCardProps = {
  className?: string;
  description: JSX.Element;
};

/**
 * Contains the following constraints:
 *  - One uppercase letter
 *  - One lowercase letter
 *  - One number
 *  - One special character
 * - At least 8 characters long
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const SignUpCard = ({ className, description }: SignUpCardProps): JSX.Element => {
  const [form] = Form.useForm();

  const createAccount = async (credentials: Credentials): Promise<void> => {
    const { password } = credentials;
    const nid = credentials.nid.trim().toLowerCase();
    const email = credentials.email.trim().toLowerCase();

    if (nid.includes(' ')) {
      form.setFields([
        {
          name: 'nid',
          errors: ['Your NID cannot contain spaces']
        }
      ]);
    }

    if (nid.length !== 8) {
      form.setFields([
        {
          name: 'nid',
          errors: ['Your NID must be 8 characters']
        }
      ]);
    }

    if (!email.endsWith('knights.ucf.edu') && !email.endsWith('ucf.edu')) {
      form.setFields([
        {
          name: 'email',
          errors: ['Must be a valid UCF email']
        }
      ]);
    }

    if (password.includes(' ') || !PASSWORD_REGEX.test(password)) {
      form.setFields([
        {
          name: 'password',
          errors: ["Your password doesn't meet the requirements"]
        }
      ]);
    }

    // Check to see if the form has any errors. If it does, we won't make an API request.
    const formErrors = form
      .getFieldsError(['nid', 'email', 'password'])
      .reduce((prev, curr) => prev.concat(curr.errors), [] as string[]);

    if (formErrors.length > 0) {
      return;
    }

    throw new Error('Not implemented');
  };

  return (
    <Card bordered={false} title="Sign Up" className={className}>
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
          label="NID"
          name="nid"
          rules={[
            {
              required: true,
              message: 'Your NID is required'
            }
          ]}
        >
          <Input type="text" maxLength={8} showCount />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          required
          tooltip="This must be a valid UCF email, knights.ucf.edu or ucf.edu"
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
          label="Password"
          name="password"
          tooltip={`
            Must be 8 characters with at least one uppercase,
            one lowercase, one number, and one special character
            (no spaces).
          `}
          required
          rules={[
            {
              required: true,
              message: 'A password is required'
            }
          ]}
        >
          <Input.Password minLength={8} showCount />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create account
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpCard;
