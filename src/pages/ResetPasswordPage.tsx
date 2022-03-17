import '../scss/reset-password-page.scss';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Form, Input, notification } from 'antd';
import { useFormik } from 'formik';
import PasswordChecklist from 'react-password-checklist';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import * as yup from 'yup';
import useLoader from '../hooks/loading';
import useUser from '../hooks/user';
import APIError from '../util/APIError';

type FormValues = {
  password: string;
  confirmedPassword: string;
};

type RouteParams = {
  userId: string;
  verificationCode: string;
};

const passwordSchema = yup.object({
  password: yup
    .string()
    .matches(/^\S*$/, 'Password cannot contain spaces')
    .required('A password is required'),
  confirmedPassword: yup
    .string()
    .matches(/^\S*$/, 'Password cannot contain spaces')
    .required('You need to confirm your password')
});

const ResetPasswordPage = (): JSX.Element => {
  const { userId = '', verificationCode = '' } = useParams<RouteParams>();
  const [form] = Form.useForm();
  const formik = useFormik<FormValues>({
    initialValues: {
      password: '',
      confirmedPassword: ''
    },
    onSubmit: values => resetPassword(values)
  });
  const [isPasswordValid, setPasswordValid] = useState(false);
  const [wasPasswordReset, setWasPasswordReset] = useState(false);
  const navigate = useNavigate();
  const loader = useLoader();
  const user = useUser();

  const resetPassword = async (formValues: FormValues) => {
    // Reset all errors in the form
    form.setFields(
      Object.keys(formValues).map(key => ({
        name: key,
        errors: []
      }))
    );

    loader.startLoading();

    try {
      const parsedValues = await passwordSchema.validate(formValues, {
        abortEarly: false
      });

      await user.resetPassword({
        verificationCode,
        userId: parseInt(userId, 10),
        password: parsedValues.password
      });

      notification.success({
        key: 'password-reset-success',
        message: 'Password Reset',
        description: 'Your password was successfully reset.'
      });

      setWasPasswordReset(true);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          err.inner.map(fieldError => ({
            name: fieldError.path || '',
            errors: [fieldError.message]
          }))
        );
      }

      if (err instanceof APIError) {
        const { status } = err;
        const description =
          status === 401
            ? 'This password reset link is invalid or has expired.'
            : 'An error occurred while resetting your password, please try again';

        notification.error({
          key: 'password-reset-error',
          message: 'Error Resetting Password',
          description
        });
      }
    }

    loader.stopLoading();
  };

  const onSubmitClick = () => {
    if (!wasPasswordReset) {
      formik.submitForm();
    } else {
      navigate('/auth');
    }
  };

  useEffect(() => {
    document.title = 'CHDR Inventory - Reset Password';
  }, []);

  return (
    <div className="reset-password-page">
      <header>
        <h1>CHDR Inventory</h1>
        <p>Center for Humanities and Digital Research</p>
      </header>
      <Card title="Reset Password" className="reset-password-card">
        <Card.Meta
          description={
            <p>
              Already have an account? <Link to="/auth">Click here to login.</Link>
            </p>
          }
        />
        <Form
          form={form}
          layout="vertical"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        >
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
          <Button
            type="primary"
            htmlType="submit"
            disabled={!wasPasswordReset && (loader.isLoading || !isPasswordValid)}
            loading={loader.isLoading}
            onClick={onSubmitClick}
          >
            {wasPasswordReset ? 'Back To Login' : 'Reset Password'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
