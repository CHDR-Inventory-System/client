import '../../scss/update-reservation-modal.scss';
import { Form, DatePicker, Select, notification, Button, Modal } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import moment from 'moment';
import * as yup from 'yup';
import { Reservation, ReservationStatus } from '../../types/API';
import { BaseModalProps } from './base-modal-props';
import useLoader from '../../hooks/loading';
import { formatDate } from '../../util/date';
import useReservations from '../../hooks/reservation';
import useUser from '../../hooks/user';
import APIError from '../../util/APIError';

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
  status: yup
    .string()
    .required('A reservation status is required')
    .oneOf(STATUSES, 'Invalid status')
});

const UpdateReservationModal = ({
  onClose,
  visible,
  reservation
}: UpdateReservationModalProps): JSX.Element => {
  const { item } = reservation;
  const user = useUser();
  const loader = useLoader();
  const [form] = Form.useForm();
  const reservations = useReservations();
  const formik = useFormik<FormValues>({
    enableReinitialize: true,
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

    try {
      const { startDateTime, endDateTime, status } = schema.validateSync(values, {
        abortEarly: false
      });

      await reservations.update({
        startDateTime,
        endDateTime,
        status: status as ReservationStatus,
        reservationId: reservation.ID,
        adminId: user.state.ID
      });

      notification.success({
        key: 'reservation-update-success',
        message: 'Reservation Update',
        description: (
          <p>
            <b>{reservation.user.fullName}</b>&apos;s reservation on <b>{item.name}</b>{' '}
            was updated.
          </p>
        )
      });

      onClose();
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

      if (err instanceof APIError) {
        notification.error({
          duration: 5,
          key: 'error-updating',
          message: 'Error Updating',
          description: `
            An error occurred while updating this reservation.
            Please try again.`
        });
      }
    }

    loader.stopLoading();
  };

  const deleteReservation = async () => {
    loader.startLoading();

    try {
      await reservations.deleteReservation(reservation.ID);

      notification.success({
        key: 'reservation-delete-success',
        message: 'Reservation Deleted',
        description: (
          <div>
            <b>{reservation.user.fullName}</b>&apos;s reservation on <b>{item.name}</b>
            &apos;s was deleted.
          </div>
        )
      });

      onClose();
    } catch {
      notification.error({
        key: 'reservation-delete-error',
        message: 'Error Deleting Reservation',
        description: `
          An unexpected error occurred while deleting this reservation,
          please try again.
        `
      });
    }

    loader.stopLoading();
  };

  const confirmDelete = () => {
    Modal.confirm({
      centered: true,
      maskStyle: {
        backgroundColor: 'rgba(0, 0, 0, 50%)'
      },
      title: 'Delete Item',
      content: (
        <p>
          Are you sure you want to delete <b>{reservation.user.fullName}</b>&apos;s{' '}
          <b>{item.name}</b>&apos;s? <b>This action cannot be undone</b>.
        </p>
      ),
      className: 'modal--dangerous',
      okText: 'Delete',
      okButtonProps: {
        className: 'ant-btn-dangerous'
      },
      onOk: () => deleteReservation()
    });
  };

  useEffect(() => {
    // Makes sure the form's values get set back to this reservation's values
    // when the modal is closed and opened again
    if (visible) {
      form.setFieldsValue({
        status: reservation.status,
        startDateTime: moment(Date.parse(reservation.startDateTime)),
        endDateTime: moment(Date.parse(reservation.endDateTime))
      });
    }
  }, [reservation, visible]);

  return (
    <Modal
      destroyOnClose
      centered
      className="update-reservation-modal"
      onCancel={onClose}
      visible={visible}
      title="Update Reservation"
      footer={[
        <Button onClick={onClose} key="close">
          Close
        </Button>,
        <Button danger key="delete" onClick={confirmDelete}>
          Delete Reservation
        </Button>,
        <Button
          onClick={() => formik.submitForm()}
          loading={loader.isLoading}
          disabled={loader.isLoading}
          type="primary"
          key="save"
        >
          Save Changes
        </Button>
      ]}
    >
      <p className="modal-description">
        <b>{reservation.user.fullName}</b> ({reservation.user.email}) has a reservation on{' '}
        <b>{item.name}</b>. This reservation was created on{' '}
        <b>
          {formatDate(reservation.created, { dateFormat: 'MMM D, YYYY [at] hh:mm A' })}
        </b>
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
