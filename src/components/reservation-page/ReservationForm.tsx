import '../../scss/reservation-form.scss';
import React, { useRef } from 'react';
import {
  Form,
  Calendar,
  TimePicker,
  Button,
  notification,
  Input,
  Select,
  InputRef
} from 'antd';
import { useFormik } from 'formik';
import moment, { Moment } from 'moment';
import * as yup from 'yup';
import { ArgsProps } from 'antd/lib/notification';
import { Item, ReservationStatus } from '../../types/API';
import useLoader from '../../hooks/loading';
import useReservations from '../../hooks/reservation';
import useUser from '../../hooks/user';
import APIError from '../../util/APIError';

type ReservationFormProps = {
  item: Item;
};

type FormValues = {
  email: string | null;
  status: ReservationStatus;
  checkoutTime: Moment | null;
  checkoutDate: Moment;
  returnTime: Moment | null;
  returnDate: Moment;
};

const todayDate = moment();
const maxReservationDate = moment().add({ days: 180 });

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

const schema = yup.object({
  // eslint-disable-next-line newline-per-chained-call
  email: yup.string().email().trim().optional().nullable(true)
});

const ReservationForm = ({ item }: ReservationFormProps): JSX.Element => {
  const loader = useLoader();
  const reservation = useReservations();
  const user = useUser();
  const [form] = Form.useForm();
  const emailInputRef = useRef<InputRef>(null);
  const formik = useFormik<FormValues>({
    initialValues: {
      checkoutTime: moment(),
      checkoutDate: moment(),
      returnTime: null,
      returnDate: moment(),
      status: 'Pending',
      email: null
    },
    onSubmit: values => onFormSubmit(values)
  });

  const onFormSubmit = async (values: FormValues) => {
    const { checkoutTime, returnTime, checkoutDate, returnDate } = values;

    if (!checkoutTime || !returnTime) {
      return;
    }

    // Reset all errors in the form
    form.setFields(
      Object.keys(values).map(key => ({
        name: key,
        errors: []
      }))
    );

    const startDateTime = checkoutDate.set({
      hour: checkoutTime.hour(),
      minute: checkoutTime.minute()
    });

    const endDateTime = returnDate.set({
      hour: returnTime.hour(),
      minute: returnTime.minute()
    });

    let hasError = false;

    if (startDateTime.isSameOrAfter(endDateTime)) {
      hasError = true;
      form.setFields([
        {
          name: 'checkoutTime',
          errors: ['Checkout time must be before return time']
        },
        {
          name: 'returnTime',
          errors: ['Return time must be after checkout time']
        }
      ]);
    }

    if (checkoutDate.isSameOrAfter(returnDate)) {
      hasError = true;
      form.setFields([
        {
          name: 'checkoutDate',
          errors: ['Checkout date must be before return date']
        },
        {
          name: 'returnDate',
          errors: ['Return date must be after checkout date']
        }
      ]);
    }

    if (hasError) {
      return;
    }

    loader.startLoading();

    try {
      const { email } = schema.validateSync(values);

      await reservation.createReservation({
        email: email || user.state.email,
        adminId: email ? user.state.ID : undefined,
        item: item.item,
        checkoutDate: checkoutDate.valueOf(),
        returnDate: returnDate.valueOf(),
        status: values.status
      });

      notification.success({
        message: 'Reservation Created',
        description: (
          <div>
            {email ? (
              <>
                Created a reservation for the user: <b>{email}</b>
              </>
            ) : (
              'A staff member will review your reservation shortly.'
            )}
          </div>
        )
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields([
          {
            name: 'email',
            errors: ['Email must be a valid email']
          }
        ]);

        emailInputRef.current?.focus();
      }

      if (err instanceof APIError) {
        const { status } = err;
        const { email } = formik.values;
        const notificationProps: Partial<ArgsProps> = {};

        switch (status) {
          case 404:
            notificationProps.message = 'User Not Found';
            notificationProps.description = "Couldn't find a user with this email.";
            break;
          case 409:
            notificationProps.message = "Couldn't Create Reservation";
            notificationProps.description = email
              ? `${email} already has a reservation for this item`
              : 'You already have a reservation for this item.';
            break;
          default:
            notificationProps.message = "Couldn't Create Reservation";
            notificationProps.description =
              'An error occurred while creating this reservation, please try again.';
        }

        notification.error({
          key: 'form-create-reservation-error',
          message: notificationProps.message,
          description: notificationProps.description
        });
      }
    }

    loader.stopLoading();
  };

  const getSubmitButtonHelpText = (): string | undefined => {
    if (!item.available) {
      return 'This item is currently unavailable';
    }

    if (item.quantity <= 0) {
      return 'This item is no longer in stock';
    }

    if (formik.values.email && formik.values.email.trim() !== user.state.email) {
      return `This will create a reservation for ${formik.values.email}`;
    }

    return undefined;
  };

  // Pressing enter when the user enters a value in the time picker doesn't set
  // the picker's value so we need to do it manually
  const onTimePickerKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    field: keyof FormValues
  ) => {
    if (event.key === 'Enter') {
      const inputValue = (event.target as HTMLInputElement).value;
      const date = moment(`${todayDate.format('MMM D, YYYY')} ${inputValue}`);

      if (date.isValid()) {
        formik.setFieldValue(field, date);
      }
    }
  };

  // <Form.Item /> needs to be nested in order to have a extra children
  // that aren't of type <Form.Item />
  // https://github.com/ant-design/ant-design/issues/25150#issuecomment-652226167
  return (
    <Form layout="vertical" form={form} className="reservation-form">
      {user.isAdminOrSuper() && (
        <Form.Item label="Email" className="email-form-item">
          <p>This is the email address of the user who want to reserve this item.</p>
          <Form.Item
            name="email"
            help={
              form.getFieldError('email')[0] ||
              'Leave blank to reserve an item under your account'
            }
          >
            <Input
              type="email"
              onChange={formik.handleChange('email')}
              ref={emailInputRef}
            />
          </Form.Item>
        </Form.Item>
      )}

      {user.isAdminOrSuper() && (
        <Form.Item
          label="Reservation Status"
          name="status"
          className="reservation-form-item"
          initialValue={formik.values.status}
        >
          <Select onChange={(value: string) => formik.setFieldValue('status', value)}>
            {STATUSES.map(status => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item label="Checkout Date">
        <p>The date your reservation for this item starts</p>
        <Form.Item name="checkoutDate">
          <Calendar
            fullscreen={false}
            validRange={[todayDate, maxReservationDate]}
            onChange={value => formik.setFieldValue('checkoutDate', value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Checkout Time">
        <p>The time your reservation for this item starts</p>
        <TimePicker
          use12Hours
          showSecond={false}
          placeholder="12:00 PM"
          format="h:mm A"
          value={formik.values.checkoutTime}
          onKeyDown={event => onTimePickerKeyDown(event, 'checkoutTime')}
          onSelect={value => formik.setFieldValue('checkoutTime', value)}
        />
      </Form.Item>

      <Form.Item label="Return Date">
        <p>The date your reservation for this item ends</p>
        <Form.Item name="returnDate">
          <Calendar
            fullscreen={false}
            validRange={[todayDate, maxReservationDate]}
            onChange={value => formik.setFieldValue('returnDate', value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Return Time">
        <p>The time your reservation for this item ends</p>
        <TimePicker
          use12Hours
          placeholder="12:00 PM"
          showSecond={false}
          format="h:mm A"
          value={formik.values.returnTime}
          onKeyDown={event => onTimePickerKeyDown(event, 'returnTime')}
          onSelect={value => formik.setFieldValue('returnTime', value)}
        />
      </Form.Item>

      <Form.Item help={getSubmitButtonHelpText()}>
        <Button
          onClick={() => formik.submitForm()}
          type="primary"
          className="form-submit-button"
          loading={loader.isLoading}
          disabled={
            loader.isLoading ||
            !item.available ||
            item.quantity <= 0 ||
            !formik.values.checkoutTime ||
            !formik.values.returnTime
          }
        >
          {loader.isLoading ? 'Creating Reservation' : 'Create Reservation'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReservationForm;
