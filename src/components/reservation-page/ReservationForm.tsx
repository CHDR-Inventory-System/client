/* eslint-disable */
import React from 'react';
import { Form, Calendar, TimePicker, Button } from 'antd';
import { useFormik } from 'formik';
import moment, { Moment } from 'moment';
import { Item } from '../../types/API';
import useLoader from '../../hooks/loading';

type ReservationFormProps = {
  item: Item;
};

type FormValues = {
  checkoutTime: Moment | null;
  checkoutDate: Moment;
  returnTime: Moment | null;
  returnDate: Moment;
};

const now = moment();
const maxReservationDate = moment().add({ days: 60 });

const ReservationForm = ({ item }: ReservationFormProps): JSX.Element => {
  const loader = useLoader();
  const [form] = Form.useForm();
  const formik = useFormik<FormValues>({
    initialValues: {
      checkoutTime: null,
      checkoutDate: moment(),
      returnTime: null,
      returnDate: moment()
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

    console.log({
      startDateTime: startDateTime.format('MMM D, YYYY, hh:mm A'),
      endDateTime: endDateTime.format('MMM D, YYYY, hh:mm A')
    });

    if (startDateTime.isSameOrAfter(endDateTime)) {
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

    if (checkoutDate.isAfter(returnDate)) {
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
  };

  // <Form.Item /> needs to be nested in order to have a extra children
  // that aren't of type <Form.Item />
  // https://github.com/ant-design/ant-design/issues/25150#issuecomment-652226167
  return (
    <Form layout="vertical" form={form}>
      <Form.Item label="Checkout Time">
        <p>The time your reservation for this item starts</p>
        <Form.Item name="checkoutTime">
          <TimePicker
            use12Hours
            showSecond={false}
            placeholder="12:00 PM"
            format="h:mm A"
            onChange={value => formik.setFieldValue('checkoutTime', value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Checkout Date">
        <p>The date your reservation for this item starts</p>
        <Form.Item name="checkoutDate">
          <Calendar
            fullscreen={false}
            validRange={[now, maxReservationDate]}
            onChange={value => formik.setFieldValue('checkoutDate', value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Return Time">
        <p>The time your reservation for this item ends</p>
        <Form.Item name="returnTime">
          <TimePicker
            use12Hours
            placeholder="12:00 PM"
            showSecond={false}
            format="h:mm A"
            onChange={value => formik.setFieldValue('returnTime', value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Return Date">
        <p>The date your reservation for this item ends</p>
        <Form.Item name="returnDate">
          <Calendar
            fullscreen={false}
            validRange={[now, maxReservationDate]}
            onChange={value => formik.setFieldValue('returnDate', value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item>
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
          Create Reservation
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReservationForm;
