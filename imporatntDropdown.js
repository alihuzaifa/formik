import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { getApiData, postApiData } from "../../headoffice/service/api";
import { AiOutlineEdit } from "react-icons/ai";
import Modal from "react-bootstrap/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import store from "../../redux/store";
import { BsPlusLg } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
// import { ToasterApp } from "../../application/components/TosterApp";

const ExpenseList = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [tableListData, setTableListData] = useState([]);
  const [getId, setgetId] = useState(0);
  const getAllExpenseListData = async () => {
    const data = await getApiData("/expenseType");
    setTableListData(data?.data?.data);
  };

  const userState = store.getState();

  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    "country.name": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });
  const filtersMap = {
    filters1: { value: filters1, callback: setFilters1 },
  };
  const onGlobalFilterChange = (event, filtersKey) => {
    const value = event.target.value;
    let filters = { ...filtersMap[filtersKey].value };
    filters["global"].value = value;

    filtersMap[filtersKey].callback(filters);
  };
  const renderHeader = (filtersKey) => {
    const filters = filtersMap[`${filtersKey}`].value;
    const value = filters["global"] ? filters["global"].value : "";

    return (
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={value || ""}
          onChange={(e) => onGlobalFilterChange(e, filtersKey)}
          placeholder="Search Expense Type"
        />
      </span>
    );
  };
  const header1 = renderHeader("filters1");

  const initialValues = {
    active: false,
    expenseTypeName: "",
    id: 0,
  };
  const validationSchema = Yup.object({
    expenseTypeName: Yup.string().required("Expense Name is required"),
  });

  useEffect(() => {
    getAllExpenseListData();
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const expenseTypeName = values.expenseTypeName;
      const dataBody = {
        active: values?.active,
        createdBy: 0,
        userId: userState.user.user.id,
        dbName: userState.user.user.dbName,
        id: values.id,
        expenseTypeName: expenseTypeName,
      };
      const postExpenseType = await postApiData("/expenseType", dataBody);
      const isSuccess = postExpenseType?.data?.isSuccess;
      if (isSuccess) {
        toast.success(`${postExpenseType?.data?.message}`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        handleClose();
        setTableListData(postExpenseType?.data?.data);
        formik.resetForm();
      }
    },
  });

  const handleEditId = async (id) => {
    setShow(true);
    const dbName = userState.user.user.dbName;
    const expenseGetById = await getApiData(
      `/expenseType/${id}?dbName=${dbName}`
    );
    formik.setValues({
      ...expenseGetById.data.data[0],
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-end col-lg-12 col-12 ps-0 pe-4 mb-3">
        <div className="d-flex gap-2 mt-4">
          <button
            className="ms-3 d-flex gap-2 quotationButton mt-3 align-items-center"
            onClick={(e) => {
              setShow(true);
            }}
            type="button"
          >
            Add <BsPlusLg />
          </button>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        limit={1}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={true}
        theme="light"
      />
      <div className="table-card">
        <DataTable
          value={tableListData}
          styleClass="myTable"
          responsiveLayout="scroll"
          scrollable
          size="large"
          resizableColumns
          columnResizeMode="expand"
          header={header1}
          filters={filters1}
          onFilter={(e) => setFilters1(e.filters)}
          scrollHeight="430px"
          emptyMessage="No customers found."
          filterDisplay="menu"
          showGridlines
          className="mt-6"
          paginator
          rows={6}
        >
          <Column
            field="id"
            header="SNO"
            sortable
            style={{ flex: "0 0 4rem", justifyContent: "center" }}
          ></Column>
          <Column
            field="expenseTypeName"
            header="Expense Name"
            sortable
          ></Column>
          <Column field="createdOn" header="Create Date" sortable></Column>
          <Column
            field="active"
            header="Active"
            body={(rowData) => {
              return (
                <div>
                  <input type="checkbox" checked={rowData.active} />
                </div>
              );
            }}
            style={{ justifyContent: "center" }}
            sortable
          ></Column>
          <Column
            field="action"
            header="Actions"
            sortable
            body={(rowData) => {
              return (
                <>
                  <AiOutlineEdit
                    size={"2em"}
                    color="green"
                    onClick={() => {
                      handleEditId(rowData.id);
                    }}
                  />
                </>
              );
            }}
            style={{ justifyContent: "center" }}
          ></Column>
        </DataTable>
      </div>

      <Modal centered size="sm" show={show} onHide={handleClose}>
        <Modal.Header closeButton />
        <Modal.Body>
          <form onSubmit={formik.handleSubmit}>
            <div className="text-center  mb-3">
              <h4>Add Expense Type</h4>

              <div className="d-flex flex-column  col-12">
                <label htmlFor="expensename" className="text-start mt-3">
                  Expense Name
                </label>
                <input
                  type="text"
                  name="expenseTypeName"
                  value={formik.values.expenseTypeName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Expense Type"
                  className="form-control py-2 mt-2"
                />
              </div>
              {formik.errors.expenseTypeName &&
              formik.touched.expenseTypeName ? (
                <div className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                  {formik.errors.expenseTypeName}
                </div>
              ) : null}
              <div className="col-12 d-flex justify-content-start mt-2 align-items-center gap-2 ms-1">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label htmlFor="active">Active</label>
              </div>
              <input
                type="hidden"
                className="my-2 ms-2"
                name="id"
                value={formik.values.id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              <div className="d-flex justify-content-end col-lg-12 col-12 ps-0 pe-4 mb-3">
                <div className="d-flex gap-2 mt-4">
                  <button className="ms-3 quotationButton" type="submit">
                    {formik.values.id === 0 ? "Save" : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExpenseList;
