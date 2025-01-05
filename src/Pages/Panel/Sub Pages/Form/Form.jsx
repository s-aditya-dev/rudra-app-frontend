import React, { useState, useEffect } from "react";
import "./Form.css";
import { useNavigate } from "react-router-dom";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";
import { useCompanies } from "../../../../hook/use-company.jsx";

const ClientListForm = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["managers"],
    queryFn: () =>
      newRequest.get("/clientVisits/managers").then((res) => {
        return res.data;
      }),
  });

  const [managers, setManagers] = useState([]);
  const {
    data: companies,
    isLoading: isCompanyLoading,
    error: isCompanyError,
  } = useCompanies();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      const sortedManagers = data
        .map((manager) => ({
          ...manager,
        }))
        .sort((a, b) => a.firstName.localeCompare(b.firstName));

      setManagers(sortedManagers);
    }
  }, [data]);

  const [user, setUser] = useState({
    clientId: null,
    firstName: "",
    lastName: "",
    address: "",
    occupation: "",
    contact: "",
    altContact: "",
    email: "",
    requirement: "",
    budget: "",
    note: "",
  });

  const [visitsourceData, setVisitsourceData] = useState({
    time: "",
    date: new Date(),
    referenceBy: "",
    sourcingManager: "",
    relationshipManager: "",
    closingManager: "",
    status: "",
    visitRemark: "",
  });

  const [budgetType, setBudgetType] = useState("");
  const [clientID, setClientID] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleVisitChange = (e) => {
    setVisitsourceData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleBudgetTypeChange = (e) => {
    setBudgetType(e.target.value);
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z]{3,}$/;
    const emailRegex = /^(N\/A|[^\s@]+@[^\s@]+\.[^\s@]+)$/;
    const contactRegex = /^\d{10}$/;
    const budgetRegex = /^(?!0\d)\d*(\.\d+)?$/;
    const newErrors = {};

    // Validate first and last names
    if (!user.firstName || !user.lastName) {
      newErrors.name = "First and last names are required";
    } else if (
      !nameRegex.test(user.firstName) ||
      !nameRegex.test(user.lastName)
    ) {
      newErrors.name =
        "Names must contain only letters and be at least 3 characters long";
    } else {
      // Validate contact
      if (!user.contact) {
        newErrors.contact = "Contact number is required";
      } else if (!contactRegex.test(user.contact)) {
        newErrors.contact = "Contact number must be exactly 10 digits";
      } else {
        if (user.altContact && !contactRegex.test(user.altContact)) {
          newErrors.contact = "Please enter the valid alt contact";
        } else {
          // Validate email
          if (!user.email || !emailRegex.test(user.email)) {
            newErrors.email = "Email must be valid";
          } else {
            // Validate address
            if (!user.address) {
              newErrors.address = "Address is required";
            } else {
              // Validate occupation
              if (!user.occupation) {
                newErrors.occupation = "Occupation is required";
              } else {
                // Validate requirement
                if (!user.requirement) {
                  newErrors.requirement = "Requirement is required";
                } else {
                  // Validate budget
                  if (!user.budget) {
                    newErrors.budget = "Budget is required";
                  } else if (!budgetRegex.test(user.budget)) {
                    newErrors.budget = "Enter a valid budget";
                  } else {
                    if (!document.getElementById("budget-type").value) {
                      newErrors.budget = "Budget Type is required";
                    } else {
                      // Validate visit date
                      if (!visitsourceData.date) {
                        newErrors.date = "Visit date is required";
                      } else if (!visitsourceData.time) {
                        newErrors.date = "Visit time is required";
                      } else {
                        // Validate referenceBy
                        if (!visitsourceData.referenceBy) {
                          newErrors.referenceBy = "Reference is required";
                        } else {
                          // Validate sourcing manager
                          if (!visitsourceData.sourcingManager) {
                            newErrors.sourcingManager =
                              "Sourcing manager is required";
                          } else {
                            // Validate relationship manager
                            if (!visitsourceData.relationshipManager) {
                              newErrors.relationshipManager =
                                "Relationship manager is required";
                            } else {
                              // Validate closing manager
                              if (!visitsourceData.closingManager) {
                                newErrors.closingManager =
                                  "Closing manager is required";
                              } else {
                                // Validate status
                                if (!visitsourceData.status) {
                                  newErrors.status = "Status is required";
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCombinedSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    let budget = parseFloat(user.budget);
    user.contact = parseInt(user.contact);

    if (user.altContact) {
      user.altContact = parseInt(user.altContact);
    }

    if (isNaN(budget)) {
      alert("Please enter a valid number for the budget.");
      return;
    }

    if (budgetType === "K") {
      user.budget = budget * 1000;
    } else if (budgetType === "Lac") {
      user.budget = budget * 100000;
    } else if (budgetType === "Cr") {
      user.budget = budget * 10000000;
    }

    try {
      const response = await newRequest.post("/clients", {
        ...user,
      });
      setClientID(response.data._id);

      await newRequest.post(`/clients/${response.data._id}/clientVisits`, {
        ...visitsourceData,
      });
      alert("Submitted successfully!");
      handleClear();
      setIsSubmitting(false);
    } catch (err) {
      console.log(err);
    }

    e.target.reset();
  };

  const handleClear = () => {
    setUser({
      clientId: null,
      firstName: "",
      lastName: "",
      address: "",
      occupation: "",
      contact: "",
      altContact: "",
      email: "",
      requirement: "",
      budget: "",
      note: "",
    });

    setVisitsourceData({
      time: "",
      date: new Date(),
      referenceBy: "",
      sourcingManager: "",
      relationshipManager: "",
      closingManager: "",
      status: "",
      visitRemark: "",
    });

    setBudgetType("");
    setErrors({});
  };

  // console.log(managers);

  return (
    <div className="form-container">
      <h3>Client Form</h3>
      <form className="client-form" onSubmit={handleCombinedSubmit}>
        <div className="col30">
          <div className="flex-width-48 name input-container">
            <label htmlFor="firstName">Name:</label>
            <div className="flex w-100">
              <input
                type="text"
                className="w-48"
                id="firstName"
                placeholder="Enter First Name"
                name="firstName"
                onChange={handleChange}
                value={user.firstName}
              />
              <input
                type="text"
                className="w-48"
                id="lastName"
                placeholder="Enter Last Name"
                name="lastName"
                onChange={handleChange}
                value={user.lastName}
              />
            </div>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="flex-width-48 phone input-container">
            <label htmlFor="phone">Phone:</label>
            <div className="w-100 flex">
              <input
                type="text"
                className="w-48"
                id="phone"
                placeholder="Phone Number"
                name="contact"
                onChange={handleChange}
                value={user.contact}
              />
              <input
                type="text"
                className="w-48"
                id="altPhone"
                placeholder="Alt Number"
                name="altContact"
                onChange={handleChange}
                value={user.altContact}
              />
            </div>
            {errors.contact && <span className="error">{errors.contact}</span>}
          </div>
          <div className="email input-container flex-width-48">
            <label htmlFor="text">Email:</label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
              id="email"
              placeholder="Email"
              value={user.email}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="address input-container flex-width-48">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              name="address"
              onChange={handleChange}
              placeholder="Address"
              value={user.address}
            ></textarea>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
        </div>

        <div className="col30">
          <div className="occupation input-container flex-width-48">
            <label htmlFor="occupation">Occupation:</label>
            <input
              type="text"
              id="occupation"
              placeholder="Occupation"
              name="occupation"
              onChange={handleChange}
              className="w-100"
              value={user.occupation}
            />
            {errors.occupation && (
              <span className="error">{errors.occupation}</span>
            )}
          </div>

          <div className="flex-width-48">
            <div className="w-100 requirement input-container">
              <label htmlFor="requirement">Requirement:</label>
              <select
                name="requirement"
                onChange={handleChange}
                className="w-100"
                id="requirement"
                value={user.requirement}
              >
                <option value="">Select Requirement</option>
                <option value="N/A">N/A</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="2.5BHK">2.5BHK</option>
                <option value="3.5BHK">3.5BHK</option>
                <option value="4.5BHK">4.5BHK</option>
                <option value="SHOP">SHOP</option>
                <option value="OFFICE">OFFICE</option>
              </select>
              {errors.requirement && (
                <span className="error">{errors.requirement}</span>
              )}
            </div>
          </div>
          <div className="flex-width-48 w-100 budget input-container">
            <label htmlFor="budget">Budget:</label>
            <div className="flex w-100">
              <input
                className="w-48"
                type="text"
                name="budget"
                onChange={handleChange}
                id="budget"
                placeholder="Budget"
                value={user.budget}
              />
              <select
                className="w-48"
                id="budget-type"
                onChange={handleBudgetTypeChange}
                value={budgetType}
              >
                <option value="">Type</option>
                <option value="K">K</option>
                <option value="Lac">Lac</option>
                <option value="Cr">Cr</option>
              </select>
            </div>
            {errors.budget && <span className="error">{errors.budget}</span>}
          </div>
          <div className="note input-container flex-width-48">
            <label htmlFor="note">Note:</label>
            <textarea
              className="w-100"
              id="note"
              name="note"
              onChange={handleChange}
              placeholder="Enter your note (optional)"
              value={user.note}
            ></textarea>
          </div>
        </div>

        <div className="AddVisit col30">
          <div className="date-time-container flex-width-48 input-container">
            <label htmlFor="visitDate">Date Time:</label>
            <div className="flex date-time w-100">
              <input
                name="date"
                onChange={handleVisitChange}
                type="date"
                value={visitsourceData.date}
                id="visitDate"
                className="w-48"
              />
              <input
                name="time"
                onChange={handleVisitChange}
                value={visitsourceData.time}
                type="time"
                id="visitTime"
                className="w-48"
              />
            </div>
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          <div className="reference-container flex-width-48 input-container">
            <label htmlFor="reference">Reference by:</label>
            <input
              type="text"
              id="reference"
              name="referenceBy"
              onChange={handleVisitChange}
              placeholder="Enter Reference"
              value={visitsourceData.referenceBy}
            />
            {/* <select
              id="reference"
              name="referenceBy"
              onChange={handleVisitChange}
              value={visitsourceData.referenceBy}
            >
              <option value="">Select Reference</option>

              <option value="N/A">N/A</option>
              <option value="Walking">Walking</option>
              {isCompanyLoading && (
                <option value="Loading" disabled>
                  Loading Companyies...
                </option>
              )}

              {isCompanyError && (
                <option value="error" disabled>
                  Error occured...
                </option>
              )}

              {companies?.map((company) => (
                <option key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </option>
              ))}

              {}
            </select> */}
            {errors.referenceBy && (
              <span className="error">{errors.referenceBy}</span>
            )}
          </div>

          <div className="drop-down flex-width-48 flex">
            <div className="source-container sp-w-100 w-48 input-container">
              <label htmlFor="source">Source:</label>
              <select
                id="source"
                onChange={handleVisitChange}
                name="sourcingManager"
                value={visitsourceData.sourcingManager}
              >
                <option value="">Select Source</option>

                <option value="N/A">N/A</option>

                {managers.map(
                  (manager) =>
                    (manager.manager === "source" ||
                      manager.manager === "relation" ||
                      manager.manager === "closing" ||
                      manager.manager === "site head") && (
                      <option key={manager._id} value={manager.username}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ),
                )}
              </select>
              {errors.sourcingManager && (
                <span className="error">{errors.sourcingManager}</span>
              )}
            </div>

            <div className="relation-container sp-w-100 w-48 input-container">
              <label htmlFor="relation">Relation:</label>
              <select
                id="relation"
                onChange={handleVisitChange}
                name="relationshipManager"
                value={visitsourceData.relationshipManager}
              >
                <option value="">Select Relation</option>

                <option value="N/A">N/A</option>

                {managers.map(
                  (manager) =>
                    (manager.manager === "source" ||
                      manager.manager === "relation" ||
                      manager.manager === "closing" ||
                      manager.manager === "site head") && (
                      <option key={manager._id} value={manager.username}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ),
                )}
              </select>
              {errors.relationshipManager && (
                <span className="error">{errors.relationshipManager}</span>
              )}
            </div>

            <div className="closing-container sp-w-100 w-48 input-container">
              <label htmlFor="closing">Closing:</label>
              <select
                id="closing"
                onChange={handleVisitChange}
                name="closingManager"
                value={visitsourceData.closingManager}
              >
                <option value="" selected>
                  Select Closing
                </option>

                <option value="N/A">N/A</option>

                {managers.map(
                  (manager) =>
                    (manager.manager === "source" ||
                      manager.manager === "relation" ||
                      manager.manager === "closing" ||
                      manager.manager === "site head") && (
                      <option key={manager._id} value={manager.username}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ),
                )}
              </select>
              {errors.closingManager && (
                <span className="error">{errors.closingManager}</span>
              )}
            </div>

            <div className="status-container sp-w-100 w-48 input-container">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                onChange={handleVisitChange}
                name="status"
                value={visitsourceData.status}
              >
                <option value="">Select Status</option>

                <option value="N/A">N/A</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="lost">Lost</option>
                <option value="booked">Booked</option>
              </select>
              {errors.status && <span className="error">{errors.status}</span>}
            </div>
          </div>

          <div className="remark input-container sp-w-100 flex-width-48">
            <label htmlFor="remark">Remark:</label>
            <textarea
              onChange={handleVisitChange}
              name="visitRemark"
              id="remark"
              placeholder="Enter your remark (optional)"
              value={visitsourceData.visitRemark}
            ></textarea>
          </div>
        </div>

        <div className="controls form-buttons w-100 flex">
          <button type="button" onClick={handleClear}>
            Clear
          </button>

          <button
            className="submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientListForm;
