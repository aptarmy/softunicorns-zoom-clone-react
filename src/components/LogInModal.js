import { Modal } from 'antd';
import { GoogleLogin } from 'react-google-login';

const LogInModal = props => {
  return (
    <Modal
      visible={props.modal.visible}
      title={props.modal.title}
      onOk={props.handleSuccess}
      onCancel={props.handleCancel}
      footer={[
        <GoogleLogin
          key="submit"
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          onSuccess={props.handleSuccess}
          onFailure={props.handleFailure}
        />
      ]}
      width={500}
    >{props.modal.child}</Modal>
  );
}

export default LogInModal;