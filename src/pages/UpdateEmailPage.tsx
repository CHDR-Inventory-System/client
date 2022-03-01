import '../scss/update-email-page.scss';
import React, { useEffect } from 'react';
import { Button, Card, Form, Input, notification } from 'antd';
import { motion, Transition, Variants } from 'framer-motion';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useSearchParams } from 'react-router-dom';
import { ArgsProps } from 'antd/lib/notification';
import useLoader from '../hooks/loading';
import useUser from '../hooks/user';
import APIError from '../util/APIError';

type FormValues = {
  email: string;
  password: string;
};

const animationOpts: Transition = {
  delay: 0.2,
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1]
};

const animationVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: 'translateY(20%)'
  },
  show: {
    opacity: 1,
    transform: 'translateY(0%)'
  }
};

const schema = yup.object({
  email: yup.string().trim().required('Your email is required'),
  password: yup.string().required('Your password is required')
});

const UpdateEmailPage = (): JSX.Element => {
  const loader = useLoader();
  const user = useUser();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const formik = useFormik<FormValues>({
    initialValues: {
      email: '',
      password: ''
    },
    onSubmit: values => updateEmail(values)
  });

  const updateEmail = async (values: FormValues) => {
    const userId = parseInt(searchParams.get('id') || '', 10);
    const verificationCode = searchParams.get('verificationCode') || '';

    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(values).map(key => ({
        name: key,
        errors: []
      }))
    );

    try {
      const parsedValues = await schema.validate(values, { abortEarly: false });

      await user.updateEmail({
        verificationCode,
        userId,
        email: parsedValues.email,
        password: parsedValues.password
      });

      notification.success({
        key: 'email-update-success',
        message: 'Email Updated',
        description: 'Your email address was successfully updated'
      });
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
        const notificationProps: Partial<ArgsProps> = {};

        switch (status) {
          case 401:
            notificationProps.message = 'Invalid Credentials';
            notificationProps.description =
              'Invalid password. Make sure your password is correct and try again.';
            break;
          case 406:
            notificationProps.message = 'Invalid Link';
            notificationProps.description = 'This link is invalid or has expired.';
            break;
          case 409:
            notificationProps.message = 'Email In Use';
            notificationProps.description = 'This email is in use by another account.';
            break;
          default:
            notificationProps.message = "Couldn't Update Email";
            notificationProps.description =
              'An error occurred while updating your email, please try again.';
            break;
        }

        notification.error({
          key: 'email-update-error',
          message: notificationProps.message,
          description: notificationProps.description
        });
      }
    }

    loader.stopLoading();
  };

  useEffect(() => {
    document.title = 'CHDR Inventory - Update Email';
  }, []);

  return (
    <div className="update-email-page">
      <header>
        <h1>CHDR Inventory</h1>
        <p>Center for Humanities and Digital Research</p>
      </header>
      <motion.div
        initial="hidden"
        animate="show"
        className="card-container"
        transition={animationOpts}
        variants={animationVariants}
      >
        <Card title="Update Your Email" className="update-email-card">
          <Card.Meta
            description={
              <p>
                <Link to="/">Click here</Link> to go back to CHDR Inventory.
              </p>
            }
          />
          <Form layout="vertical" form={form}>
            <Form.Item label="Email" name="email">
              <Input type="email" onChange={formik.handleChange('email')} />
            </Form.Item>
            <Form.Item label="Confirm Your Password" name="password">
              <Input.Password onChange={formik.handleChange('password')} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loader.isLoading}
                disabled={loader.isLoading}
                onClick={() => formik.submitForm()}
              >
                Update Email
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpdateEmailPage;
