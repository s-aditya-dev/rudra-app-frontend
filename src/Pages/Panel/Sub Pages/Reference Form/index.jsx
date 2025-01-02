import React, { useState } from "react";
import styles from "./ref-form.module.css";
import newRequest from "../../../../utils/newRequest.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const ReferenceForm = () => {
  const [newRef, setNewRef] = useState({
    companyName: "",
    ownerName: "",
    companyNumber: "",
    companyEmail: "",
    employee: {
      firstName: "",
      lastName: "",
      number: "",
      email: "",
    },
  });
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return number ? phoneRegex.test(number) : true;
  };

  const validateForm = () => {
    // Company Information Validation
    if (!newRef.companyName.trim()) {
      setError("Company name is required");
      return false;
    }

    if (!newRef.ownerName.trim()) {
      setError("Owner name is required");
      return false;
    }

    if (!newRef.companyNumber.trim()) {
      setError("Company number is required");
      return false;
    }

    if (!validatePhoneNumber(newRef.companyNumber)) {
      setError("Please enter a valid company phone number");
      return false;
    }

    if (!newRef.companyEmail) {
      setError("Company email is required");
      return false;
    }

    if (!validateEmail(newRef.companyEmail)) {
      setError("Please enter a valid company email address");
      return false;
    }

    // Employee Information Validation
    if (!newRef.employee.firstName.trim()) {
      setError("Employee first name is required");
      return false;
    }

    if (!newRef.employee.lastName.trim()) {
      setError("Employee last name is required");
      return false;
    }

    if (!newRef.employee.number.trim()) {
      setError("Employee number is required");
      return false;
    }

    if (!validatePhoneNumber(newRef.employee.number)) {
      setError("Please enter a valid employee phone number");
      return false;
    }

    if (!newRef.employee.email.trim()) {
      setError("Employee email is required");
      return false;
    }

    if (!validateEmail(newRef.employee.email)) {
      setError("Please enter a valid employee email address");
      return false;
    }

    setError("");
    return true;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (companyData) => {
      return newRequest.post("/company", companyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setNewRef({
        companyName: "",
        ownerName: "",
        companyNumber: "",
        companyEmail: "",
        employee: {
          firstName: "",
          lastName: "",
          number: "",
          email: "",
        },
      });
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.error || "Registration failed");
    },
  });

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setNewRef((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setNewRef((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error when user starts typing
    setError("");
  };

  const handleSubmit = () => {
    if (validateForm()) {
      mutate(newRef);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Reference Register</h3>
      <div className={styles["main-field-container"]}>
        <div className={styles["field-container"]}>
          <div className={styles.inputContainer}>
            <Input
              placeholder="Company name *"
              value={newRef.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              required
            />
            <Input
              placeholder="Owner name *"
              value={newRef.ownerName}
              onChange={(e) => handleInputChange("ownerName", e.target.value)}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <Input
              placeholder="Company number *"
              value={newRef.companyNumber}
              onChange={(e) =>
                handleInputChange("companyNumber", e.target.value)
              }
              required
            />
            <Input
              placeholder="Company email *"
              value={newRef.companyEmail}
              onChange={(e) =>
                handleInputChange("companyEmail", e.target.value)
              }
              required
              type="email"
            />
          </div>
        </div>
        <div className={styles["field-container"]}>
          <div className={styles.inputContainer}>
            <Input
              placeholder="Employee FirstName *"
              value={newRef.employee.firstName}
              onChange={(e) =>
                handleInputChange("employee.firstName", e.target.value)
              }
              required
            />
            <Input
              placeholder="Employee LastName *"
              value={newRef.employee.lastName}
              onChange={(e) =>
                handleInputChange("employee.lastName", e.target.value)
              }
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <Input
              placeholder="Employee number *"
              value={newRef.employee.number}
              onChange={(e) =>
                handleInputChange("employee.number", e.target.value)
              }
              required
            />
            <Input
              placeholder="Employee email *"
              value={newRef.employee.email}
              onChange={(e) =>
                handleInputChange("employee.email", e.target.value)
              }
              required
              type="email"
            />
          </div>
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.footer}>
        <button
          type="button"
          onClick={handleSubmit}
          className={styles.button}
          disabled={isPending}
        >
          {isPending ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
};

const Input = ({ ...props }) => {
  return <input type="text" className={styles.inputBox} {...props} />;
};
