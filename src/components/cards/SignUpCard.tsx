import '../../scss/sign-up-card.scss';
import React, { useState } from 'react';
import { Card, Input, Form, Button, notification } from 'antd';
import * as yup from 'yup';
import { useFormik } from 'formik';
import PasswordChecklist from 'react-password-checklist';
import { AiFillCloseCircle, AiFillCheckCircle } from 'react-icons/ai';
import { ArgsProps } from 'antd/lib/notification';
import { CardProps, Credentials } from './types';
import useUser from '../../hooks/user';
import useLoader from '../../hooks/loading';
import APIError from '../../util/APIError';

const userSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Invalid email')
    .required('An email is required'),
  password: yup
    .string()
    .matches(/^\S*$/, 'Password cannot contain spaces')
    .oneOf([yup.ref('confirmedPassword'), null], 'Passwords must match')
    .required('A password is required'),
  firstName: yup.string().trim().required('Your first name is required'),
  lastName: yup.string().trim().required('Your last name is required'),
  confirmedPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .matches(/^\S*$/, 'Password cannot contain spaces')
    .required('You need to confirm your password')
});

const SignUpCard = ({ className, description }: CardProps): JSX.Element => {
  const [form] = Form.useForm();
  const [isPasswordValid, setPasswordValid] = useState(false);
  const loader = useLoader();
  const user = useUser();
  const formik = useFormik<Credentials>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmedPassword: ''
    },
    onSubmit: values => createAccount(values)
  });

  const createAccount = async (credentials: Credentials): Promise<void> => {
    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(credentials).map(key => ({
        name: key,
        errors: []
      }))
    );

    try {
      const values = await userSchema.validate(credentials, { abortEarly: false });
      const errorMessage = 'Your password does not meet the requirements';

      if (!isPasswordValid) {
        loader.stopLoading();
        form.setFields([
          {
            name: 'password',
            errors: [errorMessage]
          },
          {
            name: 'confirmedPassword',
            errors: [errorMessage]
          }
        ]);
        return;
      }

      await user.createAccount(values);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationError = err as yup.ValidationError;

        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          validationError.inner.map(fieldError => ({
            name: fieldError.path || '',
            errors: [fieldError.message]
          }))
        );
      }

      if (err instanceof APIError) {
        const { status } = err as APIError;
        const errorObject: Partial<ArgsProps> = {
          key: 'sign-up-error',
          message: '',
          description: ''
        };

        switch (status) {
          case 400:
            errorObject.message = 'Invalid Email';
            errorObject.description = 'Please enter a valid email address and try again.';
            break;
          case 409:
            errorObject.message = 'Email In Use';
            errorObject.description =
              'This email address is already in use by another account.';
            break;
          default:
            errorObject.message = 'Error Creating Account';
            errorObject.description = 'An unexpected error occurred, please try again.';
        }

        notification.error(errorObject as ArgsProps);
      }

      loader.stopLoading();
      return;
    }

    loader.stopLoading();
    notification.close('sign-up-error');
    notification.success({
      message: 'Account Created',
      description: 'Check your email for a link to verify your account.'
    });
  };

  return (
    <Card
      bordered={false}
      title="Sign Up With Your Email"
      className={`sign-up-card ${className}`}
    >
      <Card.Meta description={description} />
      <Form
        form={form}
        layout="vertical"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      >
        <Form.Item label="First Name" name="firstName">
          <Input type="text" onChange={formik.handleChange('firstName')} />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName">
          <Input type="text" onChange={formik.handleChange('lastName')} />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input type="email" onChange={formik.handleChange('email')} />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <Input.Password onChange={formik.handleChange('password')} />
        </Form.Item>
        <Form.Item label="Confirm Password" name="confirmedPassword">
          <Input.Password onChange={formik.handleChange('confirmedPassword')} />
        </Form.Item>
        <PasswordChecklist
          iconComponents={{
            InvalidIcon: <AiFillCloseCircle className="checklist-icon valid" />,
            ValidIcon: <AiFillCheckCircle className="checklist-icon invalid" />
          }}
          className="password-checklist"
          rules={['minLength', 'specialChar', 'number', 'capital', 'match']}
          minLength={8}
          value={formik.values.password}
          valueAgain={formik.values.confirmedPassword}
          onChange={setPasswordValid}
          messages={{
            minLength: 'Password has at least 8 characters.',
            specialChar: 'Password has at least one special character.'
          }}
        />
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={loader.isLoading}
            loading={loader.isLoading}
            onClick={() => formik.submitForm()}
          >
            Create account
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpCard;
