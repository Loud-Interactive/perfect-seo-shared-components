'use client'
import { selectToasts } from "@/perfect-seo-shared-components/lib/features/User";
import * as Toast from "@radix-ui/react-toast";
import { useSelector } from "react-redux";
import ToastItem from "./ToastItem";
import { useEffect } from "react";

const ToastProvider = () => {
  const toasts = useSelector(selectToasts)

  useEffect(() => {
    console.log(toasts)
  }, [toasts])
  return (
    <Toast.Provider>
      <Toast.Viewport className="toast-viewport">
        {toasts?.length > 0 && toasts.map((toast, index) => (
          <ToastItem key={index} {...toast} />
        ))}
      </Toast.Viewport>
    </Toast.Provider>
  )

}

export default ToastProvider