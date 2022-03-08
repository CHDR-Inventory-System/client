/* eslint-disable */
import '../../scss/update-reservation-modal.scss';
import { Modal, Form, DatePicker, Select } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import moment from 'moment';
import * as yup from 'yup';
import { Reservation, ReservationStatus } from '../../types/API';
import { BaseModalProps } from './base-modal-props';
import useLoader from '../../hooks/loading';

type UpdateReservationModalProps = BaseModalProps & {
  reservation: Reservation;
};

type FormValues = {
  startDateTime: number;
  endDateTime: number;
  status: ReservationStatus;
};

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
  startDateTime: yup
    .number()
    .max(yup.ref('endDateTime'), 'Checkout date must be before return date')
    .min(0, 'A checkout date is required'),
  endDateTime: yup
    .number()
    .min(yup.ref('startDateTime'), 'Return date must be after checkout date')
    .min(0, 'A return date is required'),
  status: yup.string().required('A reservation status is required')
});

const UpdateReservationModal = ({
  onClose,
  visible,
  reservation
}: UpdateReservationModalProps): JSX.Element => {
  const { item } = reservation;
  const loader = useLoader();
  const [form] = Form.useForm();
  const formik = useFormik<FormValues>({
    initialValues: {
      startDateTime: Date.parse(reservation.startDateTime),
      endDateTime: Date.parse(reservation.endDateTime),
      status: reservation.status
    },
    onSubmit: values => updateReservation(values)
  });

  const updateReservation = async (values: FormValues) => {
    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(values).map(key => ({
        name: key,
        errors: []
      }))
    );

    console.log(values);

    try {
      schema.validateSync(values, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          err.inner.map(error => ({
            name: error.path || '',
            errors: [error.message]
          }))
        );
      }
    }

    loader.stopLoading();
  };

  useEffect(() => {
    form.setFieldsValue({
      status: reservation.status,
      startDateTime: moment(reservation.startDateTime),
      endDateTime: moment(reservation.endDateTime)
    });
  }, [reservation]);

  return (
    <Modal
      className="update-reservation-modal"
      onCancel={onClose}
      visible={visible}
      title="Update Reservation"
      cancelText="Close"
      okText="Save Changes"
      onOk={() => formik.submitForm()}
      okButtonProps={{
        loading: loader.isLoading,
        disabled: loader.isLoading
      }}
    >
      <p className="modal-description">
        <b>{reservation.user.fullName}</b> ({reservation.user.email}) has a reservation on{' '}
        <b>{item.name}</b>. This reservation was created on{' '}
        <b>{moment(reservation.created).format('MM/DD/YYYY [at] h:mm A')}</b>
      </p>
      <Form form={form} layout="vertical">
        <Form.Item label="Checkout Date" name="startDateTime">
          <DatePicker
            use12Hours
            showSecond={false}
            showTime={{ format: 'h:mm A' }}
            format="MM/DD/YYYY h:mm A"
            placeholder="MM/DD/YYYY 12:00 PM"
            onChange={date =>
              formik.setFieldValue(
                'startDateTime',
                // HACK: Set this date ahead by one millisecond so that the form
                // will thrown an error if the dates have the same month, day, and time
                date?.second(0).millisecond(1).valueOf() || -1
              )
            }
          />
        </Form.Item>
        <Form.Item required label="Return Date" name="endDateTime">
          <DatePicker
            use12Hours
            showSecond={false}
            showTime={{ format: 'h:mm A' }}
            format="MM/DD/YYYY h:mm A"
            placeholder="MM/DD/YYYY 12:00 PM"
            onChange={date =>
              formik.setFieldValue(
                'endDateTime',
                date?.second(0).millisecond(0).valueOf() || -1
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
    </Modal>
  );
};

export default UpdateReservationModal;
