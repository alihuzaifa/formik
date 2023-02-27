import React, { useState, useRef } from "react";
import { customStyles, customStylesAudit } from "../../../universal";
import Select from "react-select";
import { getApiData, postApiData } from "../../../headoffice/service/api";
import { useEffect } from "react";
import store from "../../../redux/store";
import { BsPlusLg } from "react-icons/bs";
import * as yup from "yup";
import { AiOutlineEdit } from "react-icons/ai";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { MdOutlineAutorenew } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import { useFormik } from "formik";

const AddOffice = () => {
  const userState = store.getState();
  const dbName = userState?.user?.user?.dbName;
  const [getCountryList, setgetCountryList] = useState([]);
  const [getProvinceList, setGetProvinceList] = useState([]);
  const [getServiceFeeList, setgetServiceFeeList] = useState([]);
  const [taxTerms, setTaxTerms] = useState([]);
  const [servicesFeeData, setServicesFeeData] = useState([]);
  const [auditFee, setAuditFee] = useState("");
  const [tableList, setTableList] = useState([]);
  const [index, setIndex] = useState(-1);
  const [serviceData, setServiceData] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const [isAvailable, setIsAvailbale] = useState(false);
  const [postedData, setPostedData] = useState([]);
  const [taxName, setTaxName] = useState("");
  const user = useSelector((state) => state.user?.user);

  const getCountry = async () => {
    const getCountryData = await getApiData("/country");
    const filterData = getCountryData?.data?.map((data, index) => {
      return {
        value: data?.id,
        label: data?.countryName,
      };
    });
    setgetCountryList(filterData);
  };

  const getServicesFee = async () => {
    const getServicesFeeData = await getApiData(
      `/serviceFeeType?dbName=${dbName}`
    );

    const filterData = getServicesFeeData?.data?.data?.map((data, index) => {
      return {
        value: data?.id,
        label: data?.serviceFeeTypeName,
      };
    });
    setgetServiceFeeList(filterData);
  };

  const getStateProvince = async (id) => {
    const getStateData = await getApiData(
      `/stateProvince/${id}?dbName=${dbName}`
    );
    const filterData = getStateData?.data?.map((data, index) => {
      return {
        value: data?.id,
        label: data?.stateProvinceName,
      };
    });
    setGetProvinceList(filterData);
  };

  const getTaxTerm = async () => {
    const getTaxTermData = await getApiData(`/taxTerm`);
    const filterData = getTaxTermData?.data?.data?.map((data, index) => {
      return {
        value: data?.id,
        label: data?.taxTermName,
      };
    });
    setTaxTerms(filterData);
  };

  const getServiceFee = async () => {
    const getServicesData = await getApiData("/serviceType");
    const filterData = getServicesData?.data?.data?.map((data, index) => {
      return {
        value: data?.id,
        label: data?.serviceTypeName,
      };
    });

    setServiceData(filterData);
  };

  const initialValues = {
    active: true,
    userId: 0,
    dbName: "",
    id: 0,
    officeTaxId: 0,
    taxName: "",
    taxTypeId: 0,
    taxCountryCategoryId: 0,
    countryId: 0,
    countryID: "",
    costTypeId: 0,
    taxRate: "",
    isTaxStateOther: true,
    serviceFeeTypeId: 0,
    taxTermId: 0,
    officeTaxStateMap: [],
    serviceData: false,
    taxCondition: "",
  };

  const validationSchema = yup.object({
    taxName: yup.string().required("Please enter tax"),
    taxCondition: yup.string().required("Please select any tax condition"),
    countryID: yup.object().required("Please select country"),
    serviceFeeTypeId: yup.object().required("Please select services"),
    taxRate: yup
      .number()
      .required("Please enter tax rate")
      .min(0)
      .max(100, "Invalid rate"),
    officeTaxStateMap: yup
      .array()
      .min(1, "State is Required")
      .required("State is Required"),
  });

  const addTaxData = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      console.log("values", values);
      let tempstatesObj = [];
      values.officeTaxStateMap.map((items, i) => {
        tempstatesObj.push({
          active: true,
          userId: user.id,
          dbName: user.dbName,
          id: 0,
          officeTaxDetailId: 1,
          stateProvinceId: items.value,
          stateProvinceName: items.label,
        });
      });

      let tempobj = {
        active: true,
        userId: user?.id,
        dbName: user?.dbName,
        id: 0,
        officeTaxId: 0,
        taxName: values.taxName,
        taxTypeId: 0,
        taxCountryCategoryId: 0,
        countryId: values.countryID?.value,
        costTypeId: 0,
        taxRate: Number(values.taxRate),
        isTaxStateOther: true,
        serviceFeeTypeId: values.serviceFeeTypeId?.value,
        taxTermId: 0,
        officeTaxStateMap: tempstatesObj,
      };
      setPostedData((previousData) => {
        let data = [...previousData, tempobj];
        return data;
      });
      let data = {
        taxName: values.taxName,
        taxRate: values.taxRate,
        officeTaxStateMap: values.officeTaxStateMap,
        serviceFeeTypeId: values.serviceFeeTypeId,
        taxCondition: values.taxCondition,
        serviceFeeTypeId: values.serviceFeeTypeId,
        countryID: values.countryID,
      };
      setTaxName(values?.taxName);
      if (index <= -1) {
        setTableList((previousData) => {
          let mydata = [...previousData, data];
          return mydata;
        });
        toast.success(`Added successfully`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        addTaxData.resetForm({ values: "" });
      } else {
        tableList?.splice(index, 1, data);
        addTaxData.resetForm({ values: "" });
        setIndex(-1);
        toast.success(`Updated successfully`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    },
  });
  const taxPost = useFormik({
    initialValues: {
      hello: "",
    },
    onSubmit: async (values) => {
      let mainobj = {
        active: true,
        userId: 0,
        dbName: "",
        id: 0,
        officeTaxName: "",
        officeId: 0,
        serviceId: auditFee?.value,
        isParentOfficePayable: true,
        isClientReceivable: true,
        serviceName: auditFee?.label,
        officeTaxDetail: postedData,
        officeName: "",
        taxName: taxName,
      };
      if (postedData.length > 0) {
        let postOfficeData = await postApiData("/officeTaxMaster", mainobj);
        console.log("postOfficeData==========>", postOfficeData);
        toast.success(`${postOfficeData?.data?.message}`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error(`Please fill the list`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    },
  });
  const handleEdit = (index) => {
    setIndex(index);
    const getData = tableList[index];
    let tempobj = [];
    getData.officeTaxStateMap.map((item, i) => {
      tempobj.push({
        value: item.value,
        label: item.label,
      });
    });
    addTaxData.setValues({
      ...getData,
      officeTaxStateMap: tempobj,
    });
  };

  const getId = async (id) => {
    const getServicesDropDownData = await getApiData(
      `/serviceFeeType/GetByServiceTypeId?serviceTypeId=${id}`
    );
    const filterData = getServicesDropDownData?.data?.data?.map(
      (data, index) => {
        return {
          value: data?.id,
          label: data?.serviceFeeTypeName,
        };
      }
    );
    setServicesFeeData(filterData);
  };

  useEffect(() => {
    getCountry();
    getServicesFee();
    getTaxTerm();
    getServiceFee();
  }, []);

  return (
    <>
      <div className="fade-wrapper">
        <div className="d-flex flex-column"></div>
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
        <div className="d-flex justify-content-end col-12">
          <div className="d-flex gap-2 mt-4">
            <button
              className="ms-3 d-flex gap-2 quotationButton mt-3 align-items-center"
              type="button"
              onClick={taxPost.submitForm}
              disabled={index > -1 ? true : false}
            >
              Save <FaSave />
            </button>
          </div>
        </div>
        <form onSubmit={addTaxData.handleSubmit}>
          <div className="row">
            <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4">
              <label className="mt-3 mb-2">
                Tax Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="taxName"
                value={addTaxData.values.taxName}
                onChange={addTaxData.handleChange}
                onBlur={addTaxData.handleBlur}
                placeholder="Enter Tax Name"
                className="form-control"
              />
              {addTaxData.errors.taxName && addTaxData.touched.taxName ? (
                <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                  {addTaxData.errors.taxName}
                </span>
              ) : null}
            </div>
            <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4">
              <label className="mt-3" htmlFor>
                Country <span className="text-danger">*</span>
              </label>
              <Select
                classNamePrefix="ws"
                options={getCountryList}
                id="countryID"
                name="countryID"
                isSearchable={true}
                styles={customStylesAudit}
                className="mt-2"
                placeholder="Select Country"
                onChange={(v) => {
                  addTaxData.setFieldValue("countryID", v);
                  getStateProvince(v?.value);
                }}
                value={addTaxData.values.countryID}
              />
              {addTaxData.errors.countryID && addTaxData.touched.countryID ? (
                <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                  {addTaxData.errors.countryID}
                </span>
              ) : null}
            </div>
            {/* <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4">
              <label className="mt-3" htmlFor>
                Area Wise Tax Application
              </label>
              <Select
                isMulti
                name="officeTaxStateMap"
                id="officeTaxStateMap"
                isClearable
                noOptionsMessage={() => "No Result Found"}
                className="mt-2 selectbox auditors-field"
                options={getProvinceList}
                resetValue=""
                value={addTaxData.values.officeTaxStateMap}
                styles={customStylesAudit}
                onChange={(e) => {
                  addTaxData.setFieldValue("officeTaxStateMap", e);
                }}
                classNamePrefix="filter"
              />
              {addTaxData.errors.officeTaxStateMap &&
              addTaxData.touched.officeTaxStateMap ? (
                <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                  {addTaxData.errors.officeTaxStateMap}
                </span>
              ) : null}
            </div> */}
            <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4">
              <label className="mt-3" htmlFor>
                Area Wise Tax Application <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                isClearable
                classNamePrefix="ws"
                options={getProvinceList}
                id="officeTaxStateMap"
                name="officeTaxStateMap"
                isSearchable={true}
                styles={customStylesAudit}
                className="mt-2"
                placeholder="Select state"
                onChange={(e) => {
                  addTaxData.setFieldValue("officeTaxStateMap", e);
                }}
                value={addTaxData.values.officeTaxStateMap}
              />
              {addTaxData.errors.officeTaxStateMap &&
              addTaxData.touched.officeTaxStateMap ? (
                <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                  {addTaxData.errors.officeTaxStateMap}
                </span>
              ) : null}
            </div>
          </div>
          <div className="row mt-3">
            <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4 px-0">
              <label className="mt-4 my-3 px-0" htmlFor>
                Tax is applicable on
              </label>
              <div className="d-flex justify-content-start">
                {serviceData?.map((data, index) => {
                  return (
                    <div
                      className="form-check form-check-inline mx-1"
                      key={index}
                    >
                      <input
                        onClick={() => {
                          getId(data?.value);
                          setIsClicked(true);
                        }}
                        name="serviceData"
                        className="form-check-input"
                        type="radio"
                        id={`inlineRadio2${data.value}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`inlineRadio2${data.value}`}
                      >
                        {data?.label}
                      </label>
                      {addTaxData.errors.serviceData &&
                      addTaxData.touched.serviceData ? (
                        <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                          {addTaxData.errors.serviceData}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            {isClicked ? (
              // <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4">
              //   <label className="mt-3" htmlFor>
              //     Please select your services
              //   </label>
              //   <Select
              //     name="serviceFeeTypeId"
              //     id="serviceFeeTypeId"
              //     noOptionsMessage={() => "No Result Found"}
              //     className="mt-2 selectbox auditors-field"
              // options={servicesFeeData}
              // onChange={(e) => {
              //   addTaxData.setFieldValue("serviceFeeTypeId", e);
              //   setAuditFee(e);
              // }}
              //     value={addTaxData.values.serviceFeeTypeId}
              //     styles={customStylesAudit}
              //     classNamePrefix="filter"
              //   />
              // {addTaxData.touched.serviceFeeTypeId &&
              //   addTaxData.errors.serviceFeeTypeId && (
              //     <span className="text-danger">
              //       {addTaxData.errors.serviceFeeTypeId}
              //     </span>
              //   )}
              // </div>
              <div className="d-flex flex-column col-lg-4 col-12 ps-0 pe-4">
                <label className="mt-3" htmlFor>
                  Please select your services{" "}
                  <span className="text-danger">*</span>
                </label>
                <Select
                  classNamePrefix="ws"
                  id="serviceFeeTypeId"
                  name="serviceFeeTypeId"
                  isSearchable={true}
                  styles={customStylesAudit}
                  className="mt-2"
                  placeholder="Select state"
                  options={servicesFeeData}
                  onChange={(e) => {
                    addTaxData.setFieldValue("serviceFeeTypeId", e);
                    setAuditFee(e);
                  }}
                  value={addTaxData.values.serviceFeeTypeId}
                />
                {addTaxData.touched.serviceFeeTypeId &&
                  addTaxData.errors.serviceFeeTypeId && (
                    <span className="text-danger">
                      {addTaxData.errors.serviceFeeTypeId}
                    </span>
                  )}
              </div>
            ) : null}
          </div>
          {isClicked ? (
            <>
              <div className=" row mt-3 ">
                <div className="d-flex flex-column col-lg-2 col-12 ps-0 px-0 pe-2">
                  <label className="mt-3 mb-2" htmlFor>
                    Tax Rate <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    maxLength={100}
                    minLength={0}
                    value={addTaxData.values.taxRate}
                    onChange={addTaxData.handleChange}
                    onBlur={addTaxData.handleBlur}
                    placeholder="Enter Tax Name"
                    className="form-control"
                  />
                  {addTaxData.errors.taxRate && addTaxData.touched.taxRate ? (
                    <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                      {addTaxData.errors.taxRate}
                    </span>
                  ) : null}
                </div>
                <div className="d-flex flex-column col-lg-1 col-12 ps-0 px-0 pe-2 pt-2">
                  <span className="mt-5">Percentage %</span>
                </div>
                <div className="d-flex flex-column col-lg-1 col-12 ps-0 px-0 mt-3 pe-2">
                  <label className="mt-4 mb-2" htmlFor></label>
                  <input
                    type="text"
                    name="auditFee"
                    value={auditFee?.label}
                    disabled
                    placeholder="Audit Fee"
                    className="form-control"
                  />
                </div>

                <div className="d-flex flex-column col-lg-3 col-12 ps-0 pe-4 px-0 mt-3">
                  <label className="mt-2 my-2 px-0" htmlFor>
                    Impact <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex justify-content-start">
                    {taxTerms?.map((data, index) => {
                      return (
                        <div
                          className="form-check form-check-inline mx-1"
                          key={index}
                        >
                          <input
                            onBlur={addTaxData.handleBlur}
                            value={data?.value}
                            onChange={(e) => {
                              addTaxData.setFieldValue(
                                "taxCondition",
                                e.target.value
                              );
                              console.log("e", e?.target?.value);
                            }}
                            className="form-check-input"
                            type="radio"
                            name="taxCondition"
                            id={`inlineRadio${data.value}`}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`inlineRadio${data.value}`}
                          >
                            {data?.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {addTaxData.errors.taxCondition &&
                  addTaxData.touched.taxCondition ? (
                    <span className="col-12 ps-0 pe-4 text-start mt-3 text-danger">
                      {addTaxData.errors.taxCondition}
                    </span>
                  ) : null}
                </div>
                <div className="d-flex justify-content-start col-lg-3 col-12 ps-0 pe-4"></div>
              </div>

              {index <= -1 ? (
                <div className="d-flex justify-content-end col-lg-12 col-12 ps-0">
                  <div className="d-flex gap-3 mt-4">
                    <button className="ms-3 quotationButton mt-3" type="submit">
                      <span className="me-2">Add Tax</span> <BsPlusLg />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-end col-lg-12 col-12 ps-0">
                  <div className="d-flex gap-2 mt-4">
                    <button className="ms-3 quotationButton mt-3" type="submit">
                      <span className="me-2">Update Tax</span>
                      <MdOutlineAutorenew />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 row">
                <table className="table mt-3">
                  <thead className="">
                    <tr className="quotation-table-head">
                      <th scope="col text-white">
                        <span className="quotation-table-heading">
                          Tax Name
                        </span>
                      </th>
                      <th scope="col text-white">
                        <span className="quotation-table-heading">Country</span>
                      </th>
                      <th scope="col text-white">
                        <span className="quotation-table-heading">States</span>
                      </th>
                      <th scope="col text-white">
                        <span className="quotation-table-heading">
                          Tax Applicable
                        </span>
                      </th>
                      <th scope="col text-white">
                        <span className="quotation-table-heading">
                          Tax Rate
                        </span>
                      </th>
                      <th scope="col text-white">
                        <span className="quotation-table-heading">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableList?.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td className="border">
                            <p>{data.taxName}</p>
                          </td>
                          <td className="border">
                            <p>{data.countryID?.label}</p>
                          </td>
                          <td className="col-6 border">
                            <div className="form-floating d-flex flex-wrap gap-2">
                              {data.officeTaxStateMap?.map((data, index) => {
                                return (
                                  <>
                                    {index > 0 ? "," : ""}
                                    <p key={index}>{data?.label}</p>
                                  </>
                                );
                              })}
                            </div>
                          </td>
                          <td className="border">
                            <p>{data.serviceFeeTypeId?.label}</p>
                          </td>
                          <td className="border">
                            <p>{data.taxRate}</p>
                          </td>
                          <td className="border">
                            <AiOutlineEdit
                              size={"2em"}
                              color="green"
                              onClick={() => {
                                handleEdit(index);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </form>
      </div>
    </>
  );
};
export default AddOffice;
