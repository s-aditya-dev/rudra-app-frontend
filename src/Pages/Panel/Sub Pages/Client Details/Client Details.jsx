import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./Client Details.css";

import AddVisitModal from "../AddVisit/AddVisit.jsx";
import EditVisitModal from "../EditVisit/EditVisit.jsx";
import Loader from "../../../../Components/Loader/Loader.jsx";

const ClientDetails = () => {
  const navigate = useNavigate();
  const { pageno } = useParams();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // State for client data and editing mode
  const [client, setClient] = useState({
    firstName: "",
    lastName: "",
    occupation: "",
    contact: "",
    altContact: "",
    email: "",
    address: "",
    requirement: "",
    budget: "",
    note: "",
    _id: "",
  });


  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
      navigate("/panel/client-list");
    },
  });

  const mutationClientVisitDelete = useMutation({
    mutationFn: (visitID) => {
      return newRequest.delete(`/clientVisits/${visitID}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["clientVisits"]);
      navigate(`/panel/client-details/${data._id}`); // Ensure data._id is correct here
    },
  });

  const [visits, setVisits] = useState([]);
  const [activeVisitId, setActiveVisitId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  // State for budget type and converted amount
  const [budgetType, setBudgetType] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Fetch client data using useQuery
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["client", id],
    queryFn: () => newRequest.get(`/clients/${id}`).then((res) => res.data),
  });

  // Fetch client and visit data when data changes
  useEffect(() => {
    if (data) {
      setClient(data);
      setVisits(data.clientVisits || []);
    }
  }, [data]);

  // Handle input changes for client form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClient((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Validate form fields
  const validate = () => {
    let tempErrors = {};

    const nameRegex = /^[A-Za-z]{3,}$/;
    const emailRegex = /^(N\/A|[^\s@]+@[^\s@]+\.[^\s@]+)$/;
    const contactRegex = /^\d{10}$/;
    const budgetRegex = /^(?!0\d)\d*(\.\d+)?$/;

    // Validate first and last names
    if (!client.firstName || !client.lastName) {
      tempErrors.name = "First and last names are required";
    } else if (!nameRegex.test(client.firstName) || !nameRegex.test(client.lastName)) {
      tempErrors.name = "Names must contain only letters and be at least 3 characters long";
    } else {
      // Validate occupation
      if (!client.occupation) {
        tempErrors.occupation = "Occupation is required";
      } else {
        // Validate contact
        if (!client.contact) {
          tempErrors.contact = "Contact number is required";
        } else if (!contactRegex.test(client.contact)) {
          tempErrors.contact = "Contact number must be exactly 10 digits";
        } else {

          if (client.altContact && !contactRegex.test(client.altContact)) {
            tempErrors.contact = "Please enter the valid alt contact";
          } else {
            // Validate email
            if (!client.email) {
              tempErrors.email = "Email is required";
            } else if (!emailRegex.test(client.email)) {
              tempErrors.email = "Email must be valid";
            } else {
              // Validate address
              if (!client.address) {
                tempErrors.address = "Address is required";
              } else {
                // Validate requirement
                if (!client.requirement) {
                  tempErrors.requirement = "Requirement is required";
                } else {
                  // Validate budget
                  if (!client.budget) {
                    tempErrors.budget = "Budget is required";
                  } else if (!budgetRegex.test(client.budget)) {
                    tempErrors.budget = "Enter a valid budget";
                  }
                }
              }
            }
          }
        }
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Enable editing mode
  const handleEditClick = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  // Save client details
  const handleSaveClick = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let budget = parseFloat(client.budget);
    client.contact = parseInt(client.contact);

    if (client.altContact) {
      client.altContact = parseInt(client.altContact);
    }

    setIsEditing(false);

    try {
      await newRequest.put(`/clients/${id}`, { ...client });
      navigate(`/panel/client-details/${id}`);
    } catch (error) {
      console.error("Error saving client details:", error);
    }

    console.log(`Budget: ${client.budget}`);
  };

  // Get CSS class for status
  const getStatusClass = (status) => {
    switch (status) {
      case "hot":
        return "status-hot";
      case "warm":
        return "status-warm";
      case "cold":
        return "status-cold";
      case "lost":
        return "status-lost";
      case "booked":
        return "status-booked";
      default:
        return "";
    }
  };

  // State for add modal
  const [isAddModalOpen, setModalAddOpen] = useState(false);

  // Open add modal
  const handleOpenAddModal = (e) => {
    e.preventDefault();
    setModalAddOpen(true);
  };

  // Close add modal and refetch data
  const handleCloseAddModal = (e) => {
    e.preventDefault();
    setModalAddOpen(false);
    refetch();
  };

  // State for edit modal and selected visit ID
  const [isEditModalOpen, setModalEditOpen] = useState(false);
  const [editVisitId, setEditVisitId] = useState(null);

  // Open edit modal for specific visit
  const handleOpenEditModal = (visitId) => {
    setEditVisitId(visitId);
    setModalEditOpen(true);
  };

  // Close edit modal and refetch data
  const handleCloseEditModal = () => {
    setModalEditOpen(false);
    setEditVisitId(null);
    refetch();
  };

  // Delete client
  const handleDeleteClient = (e) => {
    e.preventDefault();

    if (window.confirm("Are you sure you want to delete this Client?")) {
      mutation.mutate(id);
    }
  };

  // Placeholder for deleting a visit
  const handleDeleteVisit = (visitID) => {
    if (window.confirm("Are you sure you want to delete this Client Visit?")) {
      mutationClientVisitDelete.mutate(visitID);
    }
  };


  const handleRowClick = (VisitId) => {
    setActiveVisitId(prevVisitId => prevVisitId === VisitId ? null : VisitId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
    const year = String(date.getUTCFullYear()).slice(2);

    return `${day}-${month}-${year}`;
  };



  let count = 0;

  const lastVisit = visits[visits.length - 1] || [];

  const loadPerms = currentUser.admin || currentUser.username === lastVisit.closingManager;

  const [managers, setManagers] = useState([]);

  const { isManagerLoading, isManagerError, data: ManagerData } = useQuery({
    queryKey: ["managers"],
    queryFn: () =>
      newRequest.get("/clientVisits/managers").then((res) => res.data),
  });

  useEffect(() => {
    if (ManagerData) {
      setManagers(ManagerData);
    }
  }, [ManagerData]);

  if (isLoading || isManagerLoading) {
    return <Loader />;
  }

  if (error || isManagerError) {
    return <Loader message={`Something went wrong: ${error?.message || isManagerError.message}`} />;
  }

  const getDisplayName = (username) => {
    const manager = managers.find(m => m.username === username);
    return manager ? manager.firstName : username;
  };

  return (
    <div className="details-container">
      <form className="details-form">
        <div className="personal-info">
          <div className="clientId input-container">
            <label htmlFor="clientId">Client ID:</label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={client.clientId || ""}
              readOnly={true}
              onChange={handleInputChange}
              placeholder="Client ID"
            />
          </div>

          <div className="name w-100 input-container">
            <label htmlFor="firstName">Name:</label>
            <div className="flex w-100">
              <input
                type="text"
                className="w-45"
                id="firstName"
                name="firstName"
                value={client.firstName || ""}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="First Name"
              />
              <input
                type="text"
                className="w-45"
                id="lastName"
                name="lastName"
                value={client.lastName || ""}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
            </div>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="occupation input-container full-flex">
            <label htmlFor="occupation">Occupation:</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={client.occupation || ""}
              readOnly={!isEditing}
              onChange={handleInputChange}
              placeholder="Occupation"
            />
            {errors.occupation && <span className="error">{errors.occupation}</span>}
          </div>
        </div>

        <div className="contact">
          {!loadPerms ? null : (
            <>
              <div className="phone w-100 input-container">
                <label htmlFor="phone">Phone:</label>
                <div className="flex w-100">
                  <input
                    type="text"
                    className="w-45"
                    id="phone"
                    name="contact"
                    value={client.contact || ""}
                    readOnly={!isEditing}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    className="w-45"
                    id="altPhone"
                    name="altContact"
                    value={client.altContact || ""}
                    readOnly={!isEditing}
                    onChange={handleInputChange}
                    placeholder="Alt Number"
                  />
                </div>
                {errors.contact && <span className="error">{errors.contact}</span>}
              </div>
              <div className="email input-container full-flex">
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={client.email || ""}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
            </>
          )}



          <div className="address input-container full-flex">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              name="address"
              value={client.address || ""}
              readOnly={!isEditing}
              onChange={handleInputChange}
              placeholder="Address"
            ></textarea>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
        </div>

        <div className="interests">
          <div className="flex w-100">
            <div className="w-45 requirement input-container">
              <label htmlFor="requirement">Requirement:</label>
              <select
                className="w-100"
                id="requirement"
                name="requirement"
                value={client.requirement || ""}
                disabled={!isEditing}
                onChange={handleInputChange}
              >

                <option value="N/A">N/A</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="2.5BHK">2.5BHK</option>
                <option value="3.5BHK">3.5BHK</option>
                <option value="4.5BHK">4.5BHK</option>
                <option value="SHOP">SHOP</option>
                <option value="OFFICE">OFFICE</option>
              </select>
              {errors.requirement && <span className="error">{errors.requirement}</span>}
            </div>
            <div className="w-45 budget input-container">
              <label htmlFor="budget">Budget:</label>
              <div className="flex w-100">
                <input
                  className="w-100"
                  type="text"
                  id="budget"
                  name="budget"
                  value={client.budget || "0"}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                  placeholder="Budget"
                />
                {errors.budget && <span className="error">{errors.budget}</span>}
              </div>
            </div>
          </div>

          <div className="notes  w-100">
            <div className="note input-container full-flex">
              <label htmlFor="note">Note:</label>
              <textarea
                id="note"
                name="note"
                value={client.note || ""}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="Notes"
              ></textarea>
            </div>
          </div>

          {!currentUser.admin ? null : (
            <div className="controls flex w-100">
              {isEditing ? (
                <button
                  className="green-btn"
                  type="button"
                  onClick={handleSaveClick}
                >
                  <span className="material-symbols-rounded">save</span>
                </button>
              ) : (
                <button
                  className="blue-btn"
                  type="button"
                  onClick={handleEditClick}
                >
                  <span className="material-symbols-rounded">edit</span>
                </button>
              )}
              <button className="red-btn" onClick={handleDeleteClient}>
                <span className="material-symbols-rounded">delete</span>
              </button>

              <button className="green-btn" onClick={handleOpenAddModal}>
                Add Visit
              </button>
              <AddVisitModal
                clientName={client.firstName}
                clientID={client._id}
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
              />
            </div>
          )}

        </div>

      </form>

      <div className="visit-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reference</th>
              <th>Source</th>
              <th>Relation</th>
              <th>Closing</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit, index) => (
              <tr
                key={visit._id}
                className={activeVisitId === visit._id ? 'active' : ''}
              >
                <td data-cell='Sr No.' onClick={() => handleRowClick(visit._id)}>{++count}</td>
                <td data-cell='Date'>{formatDate(visit.date)}</td>
                <td data-cell='Time'>{visit.time}</td>
                <td data-cell='Reference By'>{visit.referenceBy}</td>
                <td data-cell='Source'>{getDisplayName(visit.sourcingManager)}</td>
                <td data-cell='Relation'>{getDisplayName(visit.relationshipManager)}</td>
                <td data-cell='Closing' onClick={() => handleRowClick(visit._id)}>{getDisplayName(visit.closingManager)}</td>
                <td data-cell='Status' onClick={() => handleRowClick(visit._id)} className={getStatusClass(visit.status)}>{visit.status}</td>
                <td data-cell='Action' className="action-buttons">
                  <div>
                    {currentUser.admin || index === visits.length - 1 ? (
                      <>
                        {!loadPerms ? null : (
                          <button
                            onClick={() => handleOpenEditModal(visit._id)}
                            className="edit blue-btn"
                          >
                            <span className="material-symbols-rounded">
                              edit
                            </span>
                          </button>
                        )}
                        <EditVisitModal
                          visitData={{
                            time: visit.time,
                            date: visit.date,
                            referenceBy: visit.referenceBy,
                            sourcingManager: visit.sourcingManager,
                            relationshipManager: visit.relationshipManager,
                            closingManager: visit.closingManager,
                            status: visit.status,
                            visitRemark: visit.visitRemark,
                          }}
                          clientId={client._id}
                          clientName={client.firstName}
                          visitID={visit._id}
                          isOpen={isEditModalOpen && editVisitId === visit._id}
                          onClose={handleCloseEditModal}
                          isAdmin={currentUser.admin}
                        />

                        {currentUser.admin ? (
                          <button
                            className="delete red-btn"
                            onClick={() => handleDeleteVisit(visit._id)}
                          >
                            <span className="material-symbols-rounded">
                              delete_forever
                            </span>
                          </button>

                        ) : null}
                        <Link to={`/panel/client-details/${pageno}/${id}/remark/${visit._id}`}>
                          <button
                            className="edit yellow-btn"
                          >
                            <span className="material-symbols-rounded">
                              chevron_right
                            </span>
                          </button>
                        </Link>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDetails;
