import '../../scss/create-reservation-drawer.scss';
import React from 'react';
import { Button, DatePicker, Drawer, Form, Input, notification, Select } from 'antd';
import * as yup from 'yup';
import { useFormik } from 'formik';
import useLoader from '../../hooks/loading';
import APIError from '../../util/APIError';
import { Item, ReservationStatus } from '../../types/API';
import useReservations from '../../hooks/reservation';
import useUser from '../../hooks/user';

type CreateReservationDrawerProps = {
  visible: boolean;
  onClose: () => void;
  item: Item;
};

type FormValues = {
  email: string;
  startDateTime: number;
  endDateTime: number;
  status: ReservationStatus;
};

const reservationSchema = yup.object({
  email: yup.string().trim().required('An email is required'),
  status: yup.string().trim().required('A status is required'),
  startDateTime: yup
    .number()
    .required('A checkout date is required')
    .max(yup.ref('endDateTime'), 'Checkout date must be before return date'),
  endDateTime: yup
    .number()
    .required('A return date is required')
    .min(yup.ref('startDateTime'), 'Return date must be after checkout date')
});

const STATUSES: ReservationStatus[] = [
  'Approved',
  'Cancelled',
  'Checked Out',
  'Denied',
  'Late',
  'Missed',
  'Pending',
  'Returned'
];

const CreateReservationDrawer = ({
  onClose,
  visible,
  item
}: CreateReservationDrawerProps): JSX.Element => {
  const [form] = Form.useForm();
  const user = useUser();
  const reservation = useReservations();
  const loader = useLoader();
  const formik = useFormik<FormValues>({
    initialValues: {} as FormValues,
    enableReinitialize: true,
    onSubmit: values => createReservation(values)
  });

  const createReservation = async (values: FormValues) => {
    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(values).map(key => ({
        name: key,
        errors: []
      }))
    );

    try {
      const parsedValues = await reservationSchema.validate(values, {
        abortEarly: false
      });

      await reservation.createReservation({
        item: item.item,
        email: parsedValues.email,
        checkoutDate: parsedValues.startDateTime,
        returnDate: parsedValues.endDateTime,
        status: parsedValues.status as ReservationStatus,
        adminId: user.state.ID
      });

      notification.success({
        key: 'create-reservation-success',
        message: 'Reservation Created',
        description: (
          <p>
            Created a reservation for user: <b>{parsedValues.email}</b>
          </p>
        )
      });

      onClose();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationError = err as yup.ValidationError;

        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          validationError.inner.map(error => ({
            name: error.path || '',
            errors: [error.message]
          }))
        );
      }

      if (err instanceof APIError) {
        notification.error({
          key: 'create-reservation-error',
          message: 'Error Creating Reservation',
          description: `
            An error occurred while creating this reservation, please try again.
          `
        });
      }
    }

    loader.stopLoading();
  };

  return (
    <Drawer
      destroyOnClose
      maskClosable
      title="Create Reservation"
      visible={visible}
      onClose={onClose}
      className="create-reservation-drawer"
      placement="right"
      extra={
        <Button
          type="primary"
          loading={loader.isLoading}
          disabled={loader.isLoading}
          onClick={() => formik.submitForm()}
        >
          Create
        </Button>
      }
    >
      <div className="drawer-header-message">
        <p>
          This will create a reservation for the item: <span>{item.name}</span>
        </p>
      </div>
      <Form layout="vertical" form={form}>
        <Form.Item
          required
          className="email-input"
          label="Email"
          name="email"
          help={
            form.getFieldError('email')[0] ||
            'This is the email address of the user who wants to reserve this item'
          }
        >
          <Input type="email" onChange={formik.handleChange('email')} />
        </Form.Item>
        <Form.Item required label="Checkout Date" name="startDateTime">
          <DatePicker
            use12Hours
            showSecond={false}
            showTime={{ format: 'hh:mm A' }}
            format="MM/DD/YYYY hh:mm A"
            placeholder="MM/DD/YYYY 12:00 AM"
            onChange={date =>
              formik.setFieldValue(
                'startDateTime',
                // HACK: Set this date ahead by one millisecond so that the form
                // will thrown an error if the dates have the same month, day, and time
                date?.second(0).millisecond(1).valueOf() || 0
              )
            }
          />
        </Form.Item>
        <Form.Item required label="Return Date" name="endDateTime">
          <DatePicker
            use12Hours
            showSecond={false}
            showTime={{ format: 'hh:mm A' }}
            format="MM/DD/YYYY hh:mm A"
            placeholder="MM/DD/YYYY 12:00 AM"
            onChange={date =>
              formik.setFieldValue(
                'endDateTime',
                date?.second(0).millisecond(0).valueOf() || 0
              )
            }
          />
        </Form.Item>
        <Form.Item required label="Reservation Status" name="status">
          <Select onChange={(value: string) => formik.setFieldValue('status', value)}>
            {STATUSES.map(status => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateReservationDrawer;
