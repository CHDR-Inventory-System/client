import '../../scss/reservation-form.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { Form, Calendar, TimePicker, Button, notification } from 'antd';
import { useFormik } from 'formik';
import moment, { Moment } from 'moment';
import { Item } from '../../types/API';
import useLoader from '../../hooks/loading';
import useReservations from '../../hooks/reservation';
import useUser from '../../hooks/user';

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
  const reservation = useReservations();
  const user = useUser();
  const [form] = Form.useForm();
  const [hasReservation, setHasReservation] = useState(false);
  const formik = useFormik<FormValues>({
    initialValues: {
      checkoutTime: null,
      checkoutDate: moment(),
      returnTime: null,
      returnDate: moment()
    },
    onSubmit: values => onFormSubmit(values)
  });

  const checkUserReservations = async () => {
    loader.startLoading();

    try {
      const userReservations = await reservation.getReservationsForItem(item.item);
      setHasReservation(
        !!userReservations.find(
          res =>
            res.user.ID === user.state.ID &&
            res.item.ID === item.ID &&
            res.status === 'Pending'
        )
      );
    } catch {
      // Ignored
    }

    loader.stopLoading();
  };

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

    if (checkoutDate.isAfter(returnDate)) {
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
      await reservation.createReservation({
        email: user.state.email,
        item: item.item,
        checkoutDate: checkoutDate.valueOf(),
        returnDate: returnDate.valueOf(),
        status: 'Pending'
      });

      notification.success({
        message: 'Reservation Created',
        description: 'A staff member will review your reservation shortly.'
      });

      setHasReservation(true);
    } catch {
      notification.error({
        key: 'form-create-reservation-error',
        message: "Couldn't Create Reservation",
        description:
          'An error occurred while creating this reservation, please try again.'
      });
    }

    loader.stopLoading();
  };

  const getDisabledText = useCallback((): string | undefined => {
    if (!item.available) {
      return 'This item is currently unavailable';
    }

    if (item.quantity <= 0) {
      return 'This item is no longer in stock';
    }

    if (hasReservation) {
      return 'You already have a pending reservation for this item';
    }

    return undefined;
  }, [hasReservation]);

  useEffect(() => {
    checkUserReservations();
  }, []);

  // <Form.Item /> needs to be nested in order to have a extra children
  // that aren't of type <Form.Item />
  // https://github.com/ant-design/ant-design/issues/25150#issuecomment-652226167
  return (
    <Form layout="vertical" form={form} className="reservation-form">
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

      <Form.Item help={getDisabledText()}>
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
            !formik.values.returnTime ||
            hasReservation
          }
        >
          Create Reservation
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReservationForm;
