import { toast, ToastPosition } from 'react-toastify'

const getToastPosition = (): ToastPosition => {
  return window.innerWidth <= 768
    ? 'top-center'
    : 'top-right'
}

const showToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  text: any
) => {
  const options = {
    position: getToastPosition(),
    autoClose: 1600,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light' as const
  }

  switch (type) {
    case 'success':
      return toast.success(text, options)

    case 'error':
      return toast.error(text, options)

    case 'warning':
      return toast.warn(text, options)

    case 'info':
      return toast.info(text, options)
  }
}

export function AlertSuccess(text: any) {
  return showToast('success', text)
}

export function AlertError(text: any) {
  return showToast('error', text)
}

export function AlertWarn(text: any) {
  return showToast('warning', text)
}

export function AlertInfo(text: any) {
  return showToast('info', text)
}