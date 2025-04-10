import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/style.css";
import "../styles/viewAsset.css";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const AssetView = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  const [zoomedImage, setZoomedImage] = useState(null);
  const [buildingCondemnationData, setBuildingCondemnationData] = useState([]); // For building condemnation data
  const [activeTab, setActiveTab] = useState("purchase");
  const [buildingMaintenanceData, setBuildingMaintenanceData] = useState([]); // For building maintenance data
  const [purchaseFilters, setPurchaseFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    purchaseDateFrom: "",
    purchaseDateTo: "",
    supplierName: "",
    source: "",
    customSource: "",
    modeOfPurchase: "",
    customModeOfPurchase: "",
    billNo: "",
    receivedBy: "",
    amcDateFrom: "",
    amcDateTo: "",
  });
  const [storeIssueFilters, setStoreIssueFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    itemDescription: "",
    location: "store",
    issuedDateFrom: "",
    issuedDateTo: "",
    itemId: "",
  });
  const [serviceReturnFilters, setServiceReturnFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    location: "",
    condition: "",
    serviceDateFrom: "",
    serviceDateTo: "",
    serviceNo: "",
    serviceAmountFrom: "",
    serviceAmountTo: "",
    buildingNo: "", // New filter for building number
  });
  const [disposalFilters, setDisposalFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    inspectionDateFrom: "",
    inspectionDateTo: "",
    condemnationDateFrom: "",
    condemnationDateTo: "",
    remark: "",
    purchaseValueFrom: "",
    purchaseValueTo: "",
    bookValueFrom: "",
    bookValueTo: "",
    disposalValueFrom: "",
    disposalValueTo: "",
  });
  const methodOfDisposalOptions = ["", "Sold", "Auctioned", "Destroyed", "Other"];
  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [deadStockFilters, setDeadStockFilters] = useState({
    assetType: "",
    customAssetType: "",
    assetCategory: "",
    customAssetCategory: "",
    subCategory: "",
    customSubCategory: "",
    itemName: "",
    methodOfDisposal: "",
    customMethodOfDisposal: "",
  });
  const assetTypeOptions = ["", "Permanent", "Consumable", "Others"];
  const permanentAssetOptions = [
    "",
    "Furniture",
    "Vehicle",
    "Building",
    "Instruments",
    "Sports and Goods",
    "Fabrics",
    "Electrical",
    "Electronics",
    "Photograph Items",
    "Land",
    "ICT Goods",
  ];
  const consumableAssetOptions = [
    "",
    "Stationery",
    "IT",
    "Electrical",
    "Plumbing",
    "Glassware/Laboratory Items",
    "Sanitory Items",
    "Sports Goods",
    "Fabrics",
    "Instruments",
  ];
  const sourceOptions = ["", "GEM", "Local", "Other"];
  const modeOfPurchaseOptions = ["", "Tender", "Quotation", "Others"];
  const conditionOptions = ["", "InService", "Serviced", "Returned", "Exchanged"];
  const locationOptions = [
    "store",
    "all_issued",
    "faculty_chamber",
    "officer_quarters",
    "staff_quarters",
    "corbett_hall",
    "champion_hall",
    "gis_lab",
    "van_vatika",
    "hostel",
    "officers_mess",
    "van_sakthi",
    "library",
    "classroom",
    "office_room",
    "officers_lounge",
    "gymnasium",
  ];
  const subCategoryOptions = {
    Furniture: ["", "Wood", "Steel", "Plastic", "Others"],
    Vehicle: ["", "Two-wheeler", "Three-wheeler", "Four-wheeler", "Bus", "Others"],
    Building: [
      "",
      "Vana Vigyan",
      "Store and Godown Building",
      "Garages",
      "Pavilion",
      "Gym Building",
      "Chandan Hostel",
      "Vana Vatika",
      "Executive Hostel",
      "Ladies Hostel",
      "Officer Trainees Mess",
      "Residential Quarters",
      "Others",
    ],
    Instruments: ["", "Laboratory", "Field Exercise Instruments", "Garden Instruments", "Others"],
    Fabrics: ["", "Curtains", "Carpets", "Others"],
    Electrical: ["", "Appliance", "Others"],
    Electronics: ["", "Audio/Visual Equipment", "ICT Equipment", "Others"],
    Land: ["", "Land with Building", "Land without Building", "Others"],
  };

  useEffect(() => {
    const fetchData = async () => {
      let endpoint = "";
      let filters = {};

      switch (activeTab) {
        case "purchase":
          endpoint = "/api/assets/filterPurchase";
          filters = {
            ...purchaseFilters,
            assetType: purchaseFilters.assetType === "Others" ? purchaseFilters.customAssetType : purchaseFilters.assetType,
            assetCategory: purchaseFilters.assetCategory === "Others" ? purchaseFilters.customAssetCategory : purchaseFilters.assetCategory,
            subCategory: purchaseFilters.subCategory === "Others" ? purchaseFilters.customSubCategory : purchaseFilters.subCategory,
            source: purchaseFilters.source === "Other" ? purchaseFilters.customSource : purchaseFilters.source,
            modeOfPurchase: purchaseFilters.modeOfPurchase === "Others" ? purchaseFilters.customModeOfPurchase : purchaseFilters.modeOfPurchase,
          };
          break;
        case "storeIssue":
          endpoint = "/api/assets/filterStoreIssue";
          filters = {
            ...storeIssueFilters,
            assetType: storeIssueFilters.assetType === "Others" ? storeIssueFilters.customAssetType : storeIssueFilters.assetType,
            assetCategory: storeIssueFilters.assetCategory === "Others" ? storeIssueFilters.customAssetCategory : storeIssueFilters.assetCategory,
            subCategory: storeIssueFilters.subCategory === "Others" ? storeIssueFilters.customSubCategory : storeIssueFilters.subCategory,
          };
          break;
        case "serviceReturn":
          endpoint = "/api/assets/filterServiceReturn";
          filters = {
            ...serviceReturnFilters,
            assetType: serviceReturnFilters.assetType === "Others" ? serviceReturnFilters.customAssetType : serviceReturnFilters.assetType,
            assetCategory: serviceReturnFilters.assetCategory === "Others" ? serviceReturnFilters.customAssetCategory : serviceReturnFilters.assetCategory,
            subCategory: serviceReturnFilters.subCategory === "Others" ? serviceReturnFilters.customSubCategory : serviceReturnFilters.subCategory,
            buildingNo: serviceReturnFilters.buildingNo, // Include new filter
          };
          break;
        case "disposal":
          endpoint = "/api/assets/filterDisposal";
          filters = {
            ...disposalFilters,
            assetType: disposalFilters.assetType === "Others" ? disposalFilters.customAssetType : disposalFilters.assetType,
            assetCategory: disposalFilters.assetCategory === "Others" ? disposalFilters.customAssetCategory : disposalFilters.assetCategory,
            subCategory: disposalFilters.subCategory === "Others" ? disposalFilters.customSubCategory : disposalFilters.subCategory,
          };
          break;
        case "deadStock":
          // First, update quantities by calling a custom endpoint
          try {
            await axios.post("http://localhost:3001/api/assets/updateDeadStockQuantities");
          } catch (error) {
            console.error("Error updating dead stock quantities:", error);
          }

          // Then fetch filtered data
          endpoint = "/api/assets/filterDeadStock";
          filters = {
            ...deadStockFilters,
            assetType: deadStockFilters.assetType === "Others" ? deadStockFilters.customAssetType : deadStockFilters.assetType,
            assetCategory: deadStockFilters.assetCategory === "Others" ? deadStockFilters.customAssetCategory : deadStockFilters.assetCategory,
            subCategory: deadStockFilters.subCategory === "Others" ? deadStockFilters.customSubCategory : deadStockFilters.subCategory,
            methodOfDisposal: deadStockFilters.methodOfDisposal === "Other" ? deadStockFilters.customMethodOfDisposal : deadStockFilters.methodOfDisposal,
          };
          break;
        default:
          return;
      }

      try {
        const response = await axios.post(`http://localhost:3001${endpoint}`, filters);
        if (activeTab === "serviceReturn") {
          setTableData(response.data.serviceReturn || []);
          setBuildingMaintenanceData(response.data.buildingMaintenance || []);
          setMessage(
            response.data.serviceReturn.length === 0 && response.data.buildingMaintenance.length === 0
              ? "No matching records found."
              : ""
          );
        } else if (activeTab === "disposal") {
          setTableData(response.data.disposal || []);
          setBuildingCondemnationData(response.data.buildingCondemnation || []);
          setMessage(
            response.data.disposal.length === 0 && response.data.buildingCondemnation.length === 0
              ? "No matching records found."
              : ""
          );
        } else {
          setTableData(response.data);
          setBuildingMaintenanceData([]); // Clear building maintenance data for other tabs
          setBuildingCondemnationData([]); // Clear building condemnation data for other tabs
          setMessage(response.data.length === 0 ? "No matching records found." : "");
        }
      } catch (error) {
        setTableData([]);
        setBuildingMaintenanceData([]);
        setBuildingCondemnationData([]);
        setMessage("Error fetching data.");
        console.error(error);
      }
    };

    fetchData();
  }, [activeTab, purchaseFilters, storeIssueFilters, serviceReturnFilters, disposalFilters, deadStockFilters]);
  const handleFilterChange = (filterSetter) => (field, value) => {
    filterSetter((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "assetType" && value !== "Others" ? { customAssetType: "" } : {}),
      ...(field === "assetCategory" && value !== "Others" ? { customAssetCategory: "" } : {}),
      ...(field === "subCategory" && value !== "Others" ? { customSubCategory: "" } : {}),
      ...(field === "source" && value !== "Other" ? { customSource: "" } : {}),
      ...(field === "modeOfPurchase" && value !== "Others" ? { customModeOfPurchase: "" } : {}),
    }));
  };

  const handleClearFilter = () => {
    switch (activeTab) {
      case "purchase":
        setPurchaseFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          purchaseDateFrom: "",
          purchaseDateTo: "",
          supplierName: "",
          source: "",
          customSource: "",
          modeOfPurchase: "",
          customModeOfPurchase: "",
          billNo: "",
          receivedBy: "",
          amcDateFrom: "",
          amcDateTo: "",
        });
        break;
      case "storeIssue":
        setStoreIssueFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          itemDescription: "",
          location: "store",
          issuedDateFrom: "",
          issuedDateTo: "",
          itemId: "",
        });
        break;
      case "serviceReturn":
        setServiceReturnFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          location: "",
          condition: "",
          serviceDateFrom: "",
          serviceDateTo: "",
          serviceNo: "",
          serviceAmountFrom: "",
          serviceAmountTo: "",
        });
        break;
      case "disposal":
        setDisposalFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          inspectionDateFrom: "",
          inspectionDateTo: "",
          condemnationDateFrom: "",
          condemnationDateTo: "",
          remark: "",
          purchaseValueFrom: "",
          purchaseValueTo: "",
          bookValueFrom: "",
          bookValueTo: "",
          disposalValueFrom: "",
          disposalValueTo: "",
        });
        break;
      case "deadStock":
        setDeadStockFilters({
          assetType: "",
          customAssetType: "",
          assetCategory: "",
          customAssetCategory: "",
          subCategory: "",
          customSubCategory: "",
          itemName: "",
          methodOfDisposal: "",
          customMethodOfDisposal: "",
        });
        break;
      default:
        break;
    }
    setTableData([]);
    setMessage("");
  };

  const getBase64ImageFromUrl = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = imageUrl;
    });
  };

  const generatePDF = async () => {
    const pdf = new jsPDF("l", "mm", "a3");
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    let logoBase64;
    try {
      logoBase64 = await getBase64ImageFromUrl("images/CASFOS-Coimbatore.jpg");
    } catch (error) {
      console.error("Error loading logo image", error);
    }
  
    const logoWidth = 50;
    const logoHeight = 50;
    const logoX = 10;
    const logoY = 10;
  
    if (logoBase64) {
      pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
    }
  
    const titleX = pageWidth / 2;
    const titleY = logoY + logoHeight / 2;
  
    pdf.setFontSize(30);
    pdf.setFont("helvetica", "bold");
    pdf.text("Central Academy for State Forest Service", titleX, titleY, { align: "center" });
  
    const currentDateTime = new Date();
    const dateString = currentDateTime.toLocaleDateString();
    const timeString = currentDateTime.toLocaleTimeString();
  
    pdf.setFontSize(17);
    pdf.text(`Date: ${dateString}`, pageWidth - 60, logoY + 20);
    pdf.text(`Time: ${timeString}`, pageWidth - 60, logoY + 30);
  
    const assetReportY = logoY + logoHeight + 20;
    pdf.setFontSize(27);
    pdf.text(
      `${activeTab === "deadStock" ? "Dead Stock Register" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Asset Report`,
      titleX,
      assetReportY,
      { align: "center" }
    );
  
    if (activeTab === "purchase") {
      const tableColumn = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Purchase Date",
        "Quantity Received",
        "Overall Price",
        "Details",
      ];
      const tableRows = tableData.map((row) => {
        const details = [
          `Bill No: ${row.billNo || "N/A"}`,
          `Supplier Name: ${row.supplierName || "N/A"}`,
          `Supplier Address: ${row.supplierAddress || "N/A"}`,
          `Source: ${row.source || "N/A"}`,
          `Mode of Purchase: ${row.modeOfPurchase || "N/A"}`,
          `Received By: ${row.receivedBy || "N/A"}`,
          `Item Description: ${row.itemDescription || "N/A"}`,
          `Unit Price: ${row.unitPrice || "N/A"}`,
          `AMC From Date: ${row.amcFromDate ? new Date(row.amcFromDate).toLocaleDateString() : "N/A"}`,
          `AMC To Date: ${row.amcToDate ? new Date(row.amcToDate).toLocaleDateString() : "N/A"}`,
          `AMC Cost: ${row.amcCost || "N/A"}`,
          `Warranty Number: ${row.warrantyNumber || "N/A"}`,
          `Warranty Valid Upto: ${row.warrantyValidUpto ? new Date(row.warrantyValidUpto).toLocaleDateString() : "N/A"}`,
          `Item IDs: ${(row.itemIds || []).join(", ") || "N/A"}`,
        ].join("\n");
  
        return [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.itemName,
          new Date(row.purchaseDate).toLocaleDateString(),
          row.quantityReceived,
          row.overallPrice,
          details,
        ];
      });
  
      pdf.setFontSize(14);
      if (totalCost.serviceCost) {
        pdf.text(`Total Purchase Cost: ₹${totalCost.serviceCost}`, pageWidth - 60, assetReportY + 10);
      }
  
      pdf.autoTable({
        startY: totalCost.serviceCost ? assetReportY + 20 : assetReportY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: { 7: { cellWidth: 50 } }, // Wider column for "Details"
        margin: { left: 10, right: 10 },
      });
    } else if (activeTab === "storeIssue" && storeIssueFilters.location === "store") {
      const tableColumn = ["Asset Category", "Sub Category", "Item Name", "Item Description", "In Stock", "Item IDs"];
      const tableRows = tableData.map((row) => [
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.inStock,
        row.itemIds?.join(", ") || "",
      ]);
  
      pdf.autoTable({
        startY: assetReportY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: tableColumn.reduce((acc, col, index) => {
          acc[index] = { cellWidth: 40 };
          return acc;
        }, {}),
        margin: { left: 10, right: 10 },
      });
    } else if (activeTab === "storeIssue" && storeIssueFilters.location !== "store") {
      const tableColumn = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Item Description",
        "Location",
        "Quantity Issued",
        "Issued Date",
        "Issued IDs",
      ];
      const tableRows = tableData.map((row) => [
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.location,
        row.quantityIssued,
        row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A",
        row.issuedIds?.join(", ") || "",
      ]);
  
      pdf.autoTable({
        startY: assetReportY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: tableColumn.reduce((acc, col, index) => {
          acc[index] = { cellWidth: 40 };
          return acc;
        }, {}),
        margin: { left: 10, right: 10 },
      });
    } else if (activeTab === "serviceReturn") {
      let startY = assetReportY + 10;
      if (totalCost.serviceCost || totalCost.maintenanceCost) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        if (totalCost.serviceCost) {
          pdf.text(`Total Service Cost: ₹${totalCost.serviceCost}`, pageWidth - 60, startY);
          startY += 10;
        }
        if (totalCost.maintenanceCost) {
          pdf.text(`Total Maintenance Cost: ₹${totalCost.maintenanceCost}`, pageWidth - 60, startY);
          startY += 10;
        }
      }
  
      const tableColumn = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Location",
        "Condition",
        ...(serviceReturnFilters.condition === "InService"
          ? ["Item ID"]
          : serviceReturnFilters.condition === "Exchanged"
          ? ["Returned Quantity"]
          : ["Item IDs", "Service No", "Service Date", "Service Amount"]),
      ];
      const tableRows = tableData.map((row) => {
        if (serviceReturnFilters.condition === "InService") {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            row.itemId || "N/A",
          ];
        } else if (serviceReturnFilters.condition === "Exchanged") {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            row.returnedQuantity || "N/A",
          ];
        } else {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            (row.itemIds || []).join(", ") || "N/A",
            row.serviceNo || "N/A",
            row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A",
            row.serviceAmount || "N/A",
          ];
        }
      });
  
      pdf.autoTable({
        startY: startY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: tableColumn.reduce((acc, col, index) => {
          acc[index] = { cellWidth: 40 };
          return acc;
        }, {}),
        margin: { left: 10, right: 10 },
      });
  
      if (serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData.length > 0) {
        const buildingTableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Building No",
          "Year of Maintenance",
          "Cost",
          "Description",
          "Custody",
          "Agency",
        ];
        const buildingTableRows = buildingMaintenanceData.map((row) => [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.buildingNo,
          new Date(row.yearOfMaintenance).toLocaleDateString(),
          row.cost,
          row.description,
          row.custody,
          row.agency,
        ]);
  
        pdf.addPage();
        pdf.setFontSize(27);
        pdf.text("Building Maintenance Records", pageWidth / 2, 20, { align: "center" });
        if (totalCost.maintenanceCost) {
          pdf.setFontSize(14);
          pdf.text(`Total Maintenance Cost: ₹${totalCost.maintenanceCost}`, pageWidth - 60, 30);
        }
        pdf.autoTable({
          startY: totalCost.maintenanceCost ? 40 : 30,
          head: [buildingTableColumn],
          body: buildingTableRows,
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
          headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          columnStyles: buildingTableColumn.reduce((acc, col, index) => {
            acc[index] = { cellWidth: 40 };
            return acc;
          }, {}),
          margin: { left: 10, right: 10 },
        });
      }
    } else if (activeTab === "disposal") {
      let startY = assetReportY + 10;
      if (totalCost.serviceCost || totalCost.demolitionEstimate) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        if (totalCost.serviceCost) {
          pdf.text(`Total Disposal Value: ₹${totalCost.serviceCost}`, pageWidth - 60, startY);
          startY += 10;
        }
        if (totalCost.demolitionEstimate) {
          pdf.text(`Total Demolition Estimate: ₹${totalCost.demolitionEstimate}`, pageWidth - 60, startY);
          startY += 10;
        }
      }
  
      const tableColumn = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Item IDs",
        "Purchase Value",
        "Book Value",
        "Inspection Date",
        "Condemnation Date",
        "Remark",
        "Disposal Value",
      ];
      const tableRows = tableData.map((row) => [
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemIds?.join(", ") || "",
        row.purchaseValue,
        row.bookValue,
        new Date(row.inspectionDate).toLocaleDateString(),
        new Date(row.condemnationDate).toLocaleDateString(),
        row.remark,
        row.disposalValue,
      ]);
  
      pdf.autoTable({
        startY: startY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: tableColumn.reduce((acc, col, index) => {
          acc[index] = { cellWidth: 40 };
          return acc;
        }, {}),
        margin: { left: 10, right: 10 },
      });
  
      if (disposalFilters.assetCategory === "Building" && buildingCondemnationData.length > 0) {
        const buildingTableColumn = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Condemnation Year",
          "Certificate Obtained",
          "Authority",
          "Date of Reference",
          "Agency",
          "Agency Reference Number",
          "Date",
          "Demolition Period",
          "Demolition Estimate",
        ];
        const buildingTableRows = buildingCondemnationData.map((row) => [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.condemnationYear,
          row.certificateObtained || "N/A",
          row.authority || "N/A",
          row.dateOfReferenceUrl || "N/A",
          row.agency || "N/A",
          row.agencyReferenceNumberUrl || "N/A",
          row.date ? new Date(row.date).toLocaleDateString() : "N/A",
          row.demolitionPeriod || "N/A",
          row.demolitionEstimate || "N/A",
        ]);
  
        pdf.addPage();
        pdf.setFontSize(27);
        pdf.text("Building Condemnation Records", pageWidth / 2, 20, { align: "center" });
        if (totalCost.demolitionEstimate) {
          pdf.setFontSize(14);
          pdf.text(`Total Demolition Estimate: ₹${totalCost.demolitionEstimate}`, pageWidth - 60, 30);
        }
        pdf.autoTable({
          startY: totalCost.demolitionEstimate ? 40 : 30,
          head: [buildingTableColumn],
          body: buildingTableRows,
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
          headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          columnStyles: buildingTableColumn.reduce((acc, col, index) => {
            acc[index] = { cellWidth: 40 };
            return acc;
          }, {}),
          margin: { left: 10, right: 10 },
        });
      }
    } else if (activeTab === "deadStock") {
      const tableColumn = [
        "S.No",
        "Article Type",
        "Article Category",
        "Article Sub Category",
        "Article Name",
        "No. of Articles Serviceable",
        "No. of Articles Condemned",
        "Balance",
        "Method of Disposal",
        "Reason for Condemnation",
        "Initial",
        "Remarks",
      ];
      const tableRows = tableData.map((row, index) => {
        const balance = row.overallQuantity - row.servicableQuantity - row.condemnedQuantity;
        return [
          index + 1,
          row.assetType,
          row.assetCategory,
          row.assetSubCategory,
          row.itemName,
          row.servicableQuantity,
          row.condemnedQuantity,
          balance >= 0 ? balance : 0,
          row.methodOfDisposal,
          row.remarks || "N/A",
          "",
          "",
        ];
      });
  
      pdf.autoTable({
        startY: assetReportY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", halign: "left" },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: tableColumn.reduce((acc, col, index) => {
          acc[index] = { cellWidth: 40 };
          return acc;
        }, {}),
        margin: { left: 10, right: 10 },
      });
    }
  
    pdf.save(`${activeTab === "deadStock" ? "dead_stock_register" : activeTab}_asset_report.pdf`);
  };
  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
  
    if (activeTab === "purchase") {
      const headers = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Purchase Date",
        "Supplier Name",
        "Quantity Received",
        "Overall Price",
      ];
      const data = tableData.map((row) => [
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        new Date(row.purchaseDate).toLocaleDateString(),
        row.supplierName,
        row.quantityReceived,
        row.overallPrice,
      ]);
  
      const wsData = [];
      if (totalCost.serviceCost) {
        wsData.push(["Total Purchase Cost", `₹${totalCost.serviceCost}`]);
        wsData.push([]); // Empty row for spacing
      }
      wsData.push(headers, ...data);
  
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Purchase Assets");
    } else if (activeTab === "storeIssue" && storeIssueFilters.location === "store") {
      const headers = ["Asset Category", "Sub Category", "Item Name", "Item Description", "In Stock", "Item IDs"];
      const data = tableData.map((row) => [
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.inStock,
        row.itemIds?.join(", ") || "",
      ]);
  
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Store Assets");
    } else if (activeTab === "storeIssue" && storeIssueFilters.location !== "store") {
      const headers = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Item Description",
        "Location",
        "Quantity Issued",
        "Issued Date",
        "Issued IDs",
      ];
      const data = tableData.map((row) => [
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemDescription,
        row.location,
        row.quantityIssued,
        row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A",
        row.issuedIds?.join(", ") || "",
      ]);
  
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Issued Assets");
    } else if (activeTab === "serviceReturn") {
      const headers = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Location",
        "Condition",
        ...(serviceReturnFilters.condition === "InService"
          ? ["Item ID"]
          : serviceReturnFilters.condition === "Exchanged"
          ? ["Returned Quantity"]
          : ["Item IDs", "Service No", "Service Date", "Service Amount"]),
      ];
      const data = tableData.map((row) => {
        if (serviceReturnFilters.condition === "InService") {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            row.itemId || "N/A",
          ];
        } else if (serviceReturnFilters.condition === "Exchanged") {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            row.returnedQuantity || "N/A",
          ];
        } else {
          return [
            row.assetType,
            row.assetCategory,
            row.subCategory,
            row.itemName,
            row.location || "N/A",
            row.condition,
            (row.itemIds || []).join(", ") || "N/A",
            row.serviceNo || "N/A",
            row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A",
            row.serviceAmount || "N/A",
          ];
        }
      });
  
      const wsData = [];
      if (totalCost.serviceCost) {
        wsData.push(["Total Service Cost", `₹${totalCost.serviceCost}`]);
      }
      if (totalCost.maintenanceCost) {
        wsData.push(["Total Maintenance Cost", `₹${totalCost.maintenanceCost}`]);
      }
      if (wsData.length > 0) {
        wsData.push([]); // Empty row for spacing
      }
      wsData.push(headers, ...data);
  
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "ServiceReturn Assets");
  
      if (serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData.length > 0) {
        const buildingHeaders = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Building No",
          "Year of Maintenance",
          "Cost",
          "Description",
          "Custody",
          "Agency",
        ];
        const buildingData = buildingMaintenanceData.map((row) => [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.buildingNo,
          new Date(row.yearOfMaintenance).toLocaleDateString(),
          row.cost,
          row.description,
          row.custody,
          row.agency,
        ]);
  
        const buildingWsData = [];
        if (totalCost.maintenanceCost) {
          buildingWsData.push(["Total Maintenance Cost", `₹${totalCost.maintenanceCost}`]);
          buildingWsData.push([]); // Empty row for spacing
        }
        buildingWsData.push(buildingHeaders, ...buildingData);
  
        const buildingWs = XLSX.utils.aoa_to_sheet(buildingWsData);
        buildingWs["!cols"] = buildingHeaders.map((header, index) => {
          const maxLength = Math.max(
            header.length,
            ...buildingData.map((row) => (row[index] ? row[index].toString().length : 0))
          );
          return { wch: Math.min(maxLength + 5, 50) };
        });
        XLSX.utils.book_append_sheet(wb, buildingWs, "Building Maintenance");
      }
    } else if (activeTab === "disposal") {
      const headers = [
        "Asset Type",
        "Asset Category",
        "Sub Category",
        "Item Name",
        "Item IDs",
        "Purchase Value",
        "Book Value",
        "Inspection Date",
        "Condemnation Date",
        "Remark",
        "Disposal Value",
      ];
      const data = tableData.map((row) => [
        row.assetType,
        row.assetCategory,
        row.subCategory,
        row.itemName,
        row.itemIds?.join(", ") || "",
        row.purchaseValue,
        row.bookValue,
        new Date(row.inspectionDate).toLocaleDateString(),
        new Date(row.condemnationDate).toLocaleDateString(),
        row.remark,
        row.disposalValue,
      ]);
  
      const wsData = [];
      if (totalCost.serviceCost) {
        wsData.push(["Total Disposal Value", `₹${totalCost.serviceCost}`]);
      }
      if (totalCost.demolitionEstimate) {
        wsData.push(["Total Demolition Estimate", `₹${totalCost.demolitionEstimate}`]);
      }
      if (wsData.length > 0) {
        wsData.push([]); // Empty row for spacing
      }
      wsData.push(headers, ...data);
  
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "Disposal Assets");
  
      if (disposalFilters.assetCategory === "Building" && buildingCondemnationData.length > 0) {
        const buildingHeaders = [
          "Asset Type",
          "Asset Category",
          "Sub Category",
          "Condemnation Year",
          "Certificate Obtained",
          "Authority",
          "Date of Reference",
          "Agency",
          "Agency Reference Number",
          "Date",
          "Demolition Period",
          "Demolition Estimate",
        ];
        const buildingData = buildingCondemnationData.map((row) => [
          row.assetType,
          row.assetCategory,
          row.subCategory,
          row.condemnationYear,
          row.certificateObtained || "N/A",
          row.authority || "N/A",
          row.dateOfReferenceUrl || "N/A",
          row.agency || "N/A",
          row.agencyReferenceNumberUrl || "N/A",
          row.date ? new Date(row.date).toLocaleDateString() : "N/A",
          row.demolitionPeriod || "N/A",
          row.demolitionEstimate || "N/A",
        ]);
  
        const buildingWsData = [];
        if (totalCost.demolitionEstimate) {
          buildingWsData.push(["Total Demolition Estimate", `₹${totalCost.demolitionEstimate}`]);
          buildingWsData.push([]); // Empty row for spacing
        }
        buildingWsData.push(buildingHeaders, ...buildingData);
  
        const buildingWs = XLSX.utils.aoa_to_sheet(buildingWsData);
        buildingWs["!cols"] = buildingHeaders.map((header, index) => {
          const maxLength = Math.max(
            header.length,
            ...buildingData.map((row) => (row[index] ? row[index].toString().length : 0))
          );
          return { wch: Math.min(maxLength + 5, 50) };
        });
        XLSX.utils.book_append_sheet(wb, buildingWs, "Building Condemnation");
      }
    } else if (activeTab === "deadStock") {
      const headers = [
        "S.No",
        "Article Type",
        "Article Category",
        "Article Sub Category",
        "Article Name",
        "No. of Articles Serviceable",
        "No. of Articles Condemned",
        "Balance",
        "Method of Disposal",
        "Reason for Condemnation",
        "Initial",
        "Remarks",
      ];
      const data = tableData.map((row, index) => {
        const balance = row.overallQuantity - row.servicableQuantity - row.condemnedQuantity;
        return [
          index + 1,
          row.assetType,
          row.assetCategory,
          row.assetSubCategory,
          row.itemName,
          row.servicableQuantity,
          row.condemnedQuantity,
          balance >= 0 ? balance : 0,
          row.methodOfDisposal,
          row.remarks || "N/A",
          "",
          "",
        ];
      });
  
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row) => (row[index] ? row[index].toString().length : 0))
        );
        return { wch: Math.min(maxLength + 5, 50) };
      });
      XLSX.utils.book_append_sheet(wb, ws, "DeadStock Assets");
    }
  
    XLSX.writeFile(wb, `${activeTab === "deadStock" ? "dead_stock_register" : activeTab}_assets.xlsx`);
  };
  const showDetails = (row) => {
    setSelectedDetails(row);
  };

  const closeDetails = () => {
    setSelectedDetails(null);
  };

  // Calculate total costs
  const calculateTotalCost = () => {
    let serviceCost = null;
    let maintenanceCost = null;
    let demolitionEstimate = null;
  
    if (activeTab === "purchase") {
      serviceCost = tableData.reduce((sum, row) => sum + (parseFloat(row.overallPrice) || 0), 0);
      return {
        serviceCost: serviceCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        maintenanceCost: null,
        demolitionEstimate: null,
      };
    } else if (activeTab === "serviceReturn" && serviceReturnFilters.condition !== "InService" && serviceReturnFilters.condition !== "Exchanged") {
      serviceCost = tableData.reduce((sum, row) => sum + (parseFloat(row.serviceAmount) || 0), 0);
      if (serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData.length > 0) {
        maintenanceCost = buildingMaintenanceData.reduce((sum, row) => sum + (parseFloat(row.cost) || 0), 0);
      }
      return {
        serviceCost: serviceCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        maintenanceCost: maintenanceCost
          ? maintenanceCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : null,
        demolitionEstimate: null,
      };
    } else if (activeTab === "disposal") {
      serviceCost = tableData.reduce((sum, row) => sum + (parseFloat(row.disposalValue) || 0), 0);
      if (disposalFilters.assetCategory === "Building" && buildingCondemnationData.length > 0) {
        demolitionEstimate = buildingCondemnationData.reduce((sum, row) => sum + (parseFloat(row.demolitionEstimate) || 0), 0);
      }
      return {
        serviceCost: serviceCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        maintenanceCost: null,
        demolitionEstimate: demolitionEstimate
          ? demolitionEstimate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : null,
      };
    }
    return { serviceCost: null, maintenanceCost: null, demolitionEstimate: null }; // No total cost for other tabs
  };
  
  

  const totalCost = calculateTotalCost();

  return (
    <div className="admin-asset-view">
      <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">ASSET ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/assetentrystaffdashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/assetstore?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Store</span>
            </a>
          </li>
          <li>
            <a href={`/assetissue?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Asset Issue</span>
            </a>
          </li>
          <li>
            <a href={`/assetreturn?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Asset Return</span>
            </a>
          </li>
          <li className="active">
            <a href={`/viewasset?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Asset View</span>
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="/" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      <main style={styles.mainContent}>
        <div className="dash-content">
          <div className="title">
            <span className="text">Asset View</span>
          </div>

          <div className="admin-asset-tabs" style={{ marginBottom: "20px" }}>
            <button className={activeTab === "purchase" ? "active" : ""} onClick={() => setActiveTab("purchase")}>
              Purchase
            </button>
            <button className={activeTab === "storeIssue" ? "active" : ""} onClick={() => setActiveTab("storeIssue")}>
              Store/Issue
            </button>
            <button className={activeTab === "serviceReturn" ? "active" : ""} onClick={() => setActiveTab("serviceReturn")}>
              Service/Return
            </button>
            <button className={activeTab === "disposal" ? "active" : ""} onClick={() => setActiveTab("disposal")}>
              Disposal
            </button>
            <button className={activeTab === "deadStock" ? "active" : ""} onClick={() => setActiveTab("deadStock")}>
              Dead Stock Register
            </button>
          </div>

          <div className="admin-asset-filter-container">
            {activeTab === "purchase" && (
              <div className="admin-asset-filter-grid">
                <div className="admin-asset-filter-item">
                  <label>Asset Type</label>
                  <select
                    value={purchaseFilters.assetType}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("assetType", e.target.value)}
                  >
                    {assetTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Asset Type"}
                      </option>
                    ))}
                  </select>
                  {purchaseFilters.assetType === "Others" && (
                    <input
                      type="text"
                      value={purchaseFilters.customAssetType}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("customAssetType", e.target.value)}
                      placeholder="Enter custom asset type"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Asset Category</label>
                  <select
                    value={purchaseFilters.assetCategory}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("assetCategory", e.target.value)}
                  >
                    {purchaseFilters.assetType === "Permanent"
                      ? permanentAssetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Category"}
                        </option>
                      ))
                      : purchaseFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select Category"}
                          </option>
                        ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                  </select>
                  {purchaseFilters.assetCategory === "Others" && (
                    <input
                      type="text"
                      value={purchaseFilters.customAssetCategory}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("customAssetCategory", e.target.value)}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Sub Category</label>
                  <select
                    value={purchaseFilters.subCategory}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("subCategory", e.target.value)}
                    disabled={!purchaseFilters.assetCategory || purchaseFilters.assetCategory === "Others"}
                  >
                    {subCategoryOptions[purchaseFilters.assetCategory]?.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Sub Category"}
                      </option>
                    )) || [<option key="" value="">Select Category First</option>]}
                  </select>
                  {purchaseFilters.subCategory === "Others" && (
                    <input
                      type="text"
                      value={purchaseFilters.customSubCategory}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("customSubCategory", e.target.value)}
                      placeholder="Enter custom sub category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={purchaseFilters.itemName}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("itemName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Purchase Date From</label>
                  <input
                    type="date"
                    value={purchaseFilters.purchaseDateFrom}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("purchaseDateFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Purchase Date To</label>
                  <input
                    type="date"
                    value={purchaseFilters.purchaseDateTo}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("purchaseDateTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    value={purchaseFilters.supplierName}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("supplierName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Source</label>
                  <select
                    value={purchaseFilters.source}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("source", e.target.value)}
                  >
                    {sourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Source"}
                      </option>
                    ))}
                  </select>
                  {purchaseFilters.source === "Other" && (
                    <input
                      type="text"
                      value={purchaseFilters.customSource}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("customSource", e.target.value)}
                      placeholder="Enter custom source"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Mode of Purchase</label>
                  <select
                    value={purchaseFilters.modeOfPurchase}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("modeOfPurchase", e.target.value)}
                  >
                    {modeOfPurchaseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Mode"}
                      </option>
                    ))}
                  </select>
                  {purchaseFilters.modeOfPurchase === "Others" && (
                    <input
                      type="text"
                      value={purchaseFilters.customModeOfPurchase}
                      onChange={(e) => handleFilterChange(setPurchaseFilters)("customModeOfPurchase", e.target.value)}
                      placeholder="Enter custom mode"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Bill No</label>
                  <input
                    type="text"
                    value={purchaseFilters.billNo}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("billNo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Received By</label>
                  <input
                    type="text"
                    value={purchaseFilters.receivedBy}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("receivedBy", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>AMC Date From</label>
                  <input
                    type="date"
                    value={purchaseFilters.amcDateFrom}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("amcDateFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>AMC Date To</label>
                  <input
                    type="date"
                    value={purchaseFilters.amcDateTo}
                    onChange={(e) => handleFilterChange(setPurchaseFilters)("amcDateTo", e.target.value)}
                  />
                </div>
                <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                  Clear Filter
                </button>
              </div>
            )}
            {activeTab === "deadStock" && (
              <div className="admin-asset-filter-grid">
                <div className="admin-asset-filter-item">
                  <label>Article Type</label>
                  <select
                    value={deadStockFilters.assetType}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("assetType", e.target.value)}
                  >
                    {assetTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Article Type"}
                      </option>
                    ))}
                  </select>
                  {deadStockFilters.assetType === "Others" && (
                    <input
                      type="text"
                      value={deadStockFilters.customAssetType}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customAssetType", e.target.value)}
                      placeholder="Enter custom article type"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Article Category</label>
                  <select
                    value={deadStockFilters.assetCategory}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("assetCategory", e.target.value)}
                  >
                    {deadStockFilters.assetType === "Permanent"
                      ? permanentAssetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Category"}
                        </option>
                      ))
                      : deadStockFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select Category"}
                          </option>
                        ))
                        : [<option key="" value="">Select Article Type First</option>]}
                  </select>
                  {deadStockFilters.assetCategory === "Others" && (
                    <input
                      type="text"
                      value={deadStockFilters.customAssetCategory}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customAssetCategory", e.target.value)}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Article Sub Category</label>
                  <select
                    value={deadStockFilters.subCategory}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("subCategory", e.target.value)}
                    disabled={!deadStockFilters.assetCategory || deadStockFilters.assetCategory === "Others"}
                  >
                    {subCategoryOptions[deadStockFilters.assetCategory]?.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Sub Category"}
                      </option>
                    )) || [<option key="" value="">Select Category First</option>]}
                  </select>
                  {deadStockFilters.subCategory === "Others" && (
                    <input
                      type="text"
                      value={deadStockFilters.customSubCategory}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customSubCategory", e.target.value)}
                      placeholder="Enter custom sub category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Article Name</label>
                  <input
                    type="text"
                    value={deadStockFilters.itemName}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("itemName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Method of Disposal</label>
                  <select
                    value={deadStockFilters.methodOfDisposal}
                    onChange={(e) => handleFilterChange(setDeadStockFilters)("methodOfDisposal", e.target.value)}
                  >
                    {methodOfDisposalOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Method"}
                      </option>
                    ))}
                  </select>
                  {deadStockFilters.methodOfDisposal === "Other" && (
                    <input
                      type="text"
                      value={deadStockFilters.customMethodOfDisposal}
                      onChange={(e) => handleFilterChange(setDeadStockFilters)("customMethodOfDisposal", e.target.value)}
                      placeholder="Enter custom method"
                    />
                  )}
                </div>
                <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                  Clear Filter
                </button>
              </div>
            )}
            {activeTab === "storeIssue" && (
              <div className="admin-asset-filter-grid">
                <div className="admin-asset-filter-item">
                  <label>Asset Type</label>
                  <select
                    value={storeIssueFilters.assetType}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("assetType", e.target.value)}
                  >
                    {assetTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Asset Type"}
                      </option>
                    ))}
                  </select>
                  {storeIssueFilters.assetType === "Others" && (
                    <input
                      type="text"
                      value={storeIssueFilters.customAssetType}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("customAssetType", e.target.value)}
                      placeholder="Enter custom asset type"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Asset Category</label>
                  <select
                    value={storeIssueFilters.assetCategory}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("assetCategory", e.target.value)}
                  >
                    {storeIssueFilters.assetType === "Permanent"
                      ? permanentAssetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Category"}
                        </option>
                      ))
                      : storeIssueFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select Category"}
                          </option>
                        ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                  </select>
                  {storeIssueFilters.assetCategory === "Others" && (
                    <input
                      type="text"
                      value={storeIssueFilters.customAssetCategory}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("customAssetCategory", e.target.value)}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Sub Category</label>
                  <select
                    value={storeIssueFilters.subCategory}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("subCategory", e.target.value)}
                    disabled={!storeIssueFilters.assetCategory || storeIssueFilters.assetCategory === "Others"}
                  >
                    {subCategoryOptions[storeIssueFilters.assetCategory]?.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Sub Category"}
                      </option>
                    )) || [<option key="" value="">Select Category First</option>]}
                  </select>
                  {storeIssueFilters.subCategory === "Others" && (
                    <input
                      type="text"
                      value={storeIssueFilters.customSubCategory}
                      onChange={(e) => handleFilterChange(setStoreIssueFilters)("customSubCategory", e.target.value)}
                      placeholder="Enter custom sub category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={storeIssueFilters.itemName}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("itemName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Item Description</label>
                  <input
                    type="text"
                    value={storeIssueFilters.itemDescription}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("itemDescription", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Item ID</label>
                  <input
                    type="text"
                    value={storeIssueFilters.itemId}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("itemId", e.target.value)}
                    placeholder="Enter Item ID"
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Location</label>
                  <select
                    value={storeIssueFilters.location}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("location", e.target.value)}
                  >
                    {locationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-asset-filter-item">
                  <label>Issued Date From</label>
                  <input
                    type="date"
                    value={storeIssueFilters.issuedDateFrom}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("issuedDateFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Issued Date To</label>
                  <input
                    type="date"
                    value={storeIssueFilters.issuedDateTo}
                    onChange={(e) => handleFilterChange(setStoreIssueFilters)("issuedDateTo", e.target.value)}
                  />
                </div>
                <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                  Clear Filter
                </button>
              </div>
            )}

            {activeTab === "serviceReturn" && (
              <div className="admin-asset-filter-grid">
                <div className="admin-asset-filter-item">
                  <label>Asset Type</label>
                  <select
                    value={serviceReturnFilters.assetType}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("assetType", e.target.value)}
                  >
                    {assetTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Asset Type"}
                      </option>
                    ))}
                  </select>
                  {serviceReturnFilters.assetType === "Others" && (
                    <input
                      type="text"
                      value={serviceReturnFilters.customAssetType}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("customAssetType", e.target.value)}
                      placeholder="Enter custom asset type"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Asset Category</label>
                  <select
                    value={serviceReturnFilters.assetCategory}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("assetCategory", e.target.value)}
                  >
                    {serviceReturnFilters.assetType === "Permanent"
                      ? permanentAssetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Category"}
                        </option>
                      ))
                      : serviceReturnFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select Category"}
                          </option>
                        ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                  </select>
                  {serviceReturnFilters.assetCategory === "Others" && (
                    <input
                      type="text"
                      value={serviceReturnFilters.customAssetCategory}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("customAssetCategory", e.target.value)}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Sub Category</label>
                  <select
                    value={serviceReturnFilters.subCategory}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("subCategory", e.target.value)}
                    disabled={!serviceReturnFilters.assetCategory || serviceReturnFilters.assetCategory === "Others"}
                  >
                    {subCategoryOptions[serviceReturnFilters.assetCategory]?.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Sub Category"}
                      </option>
                    )) || [<option key="" value="">Select Category First</option>]}
                  </select>
                  {serviceReturnFilters.subCategory === "Others" && (
                    <input
                      type="text"
                      value={serviceReturnFilters.customSubCategory}
                      onChange={(e) => handleFilterChange(setServiceReturnFilters)("customSubCategory", e.target.value)}
                      placeholder="Enter custom sub category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={serviceReturnFilters.itemName}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("itemName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Location</label>
                  <input
                    type="text"
                    value={serviceReturnFilters.location}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("location", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Condition</label>
                  <select
                    value={serviceReturnFilters.condition}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("condition", e.target.value)}
                  >
                    {conditionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "All Conditions"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-asset-filter-item">
                  <label>Service Date From</label>
                  <input
                    type="date"
                    value={serviceReturnFilters.serviceDateFrom}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceDateFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Service Date To</label>
                  <input
                    type="date"
                    value={serviceReturnFilters.serviceDateTo}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceDateTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Service No</label>
                  <input
                    type="text"
                    value={serviceReturnFilters.serviceNo}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceNo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Service Amount From</label>
                  <input
                    type="number"
                    value={serviceReturnFilters.serviceAmountFrom}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceAmountFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Service Amount To</label>
                  <input
                    type="number"
                    value={serviceReturnFilters.serviceAmountTo}
                    onChange={(e) => handleFilterChange(setServiceReturnFilters)("serviceAmountTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
      <label>Building No</label>
      <input
        type="text"
        value={serviceReturnFilters.buildingNo}
        onChange={(e) => handleFilterChange(setServiceReturnFilters)("buildingNo", e.target.value)}
        placeholder="Enter Building No"
      />
    </div>
                <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                  Clear Filter
                </button>
              </div>
            )}

            {activeTab === "disposal" && (
              <div className="admin-asset-filter-grid">
                <div className="admin-asset-filter-item">
                  <label>Asset Type</label>
                  <select
                    value={disposalFilters.assetType}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("assetType", e.target.value)}
                  >
                    {assetTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Asset Type"}
                      </option>
                    ))}
                  </select>
                  {disposalFilters.assetType === "Others" && (
                    <input
                      type="text"
                      value={disposalFilters.customAssetType}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("customAssetType", e.target.value)}
                      placeholder="Enter custom asset type"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Asset Category</label>
                  <select
                    value={disposalFilters.assetCategory}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("assetCategory", e.target.value)}
                  >
                    {disposalFilters.assetType === "Permanent"
                      ? permanentAssetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option || "Select Category"}
                        </option>
                      ))
                      : disposalFilters.assetType === "Consumable"
                        ? consumableAssetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option || "Select Category"}
                          </option>
                        ))
                        : [<option key="" value="">Select Asset Type First</option>]}
                  </select>
                  {disposalFilters.assetCategory === "Others" && (
                    <input
                      type="text"
                      value={disposalFilters.customAssetCategory}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("customAssetCategory", e.target.value)}
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Sub Category</label>
                  <select
                    value={disposalFilters.subCategory}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("subCategory", e.target.value)}
                    disabled={!disposalFilters.assetCategory || disposalFilters.assetCategory === "Others"}
                  >
                    {subCategoryOptions[disposalFilters.assetCategory]?.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Sub Category"}
                      </option>
                    )) || [<option key="" value="">Select Category First</option>]}
                  </select>
                  {disposalFilters.subCategory === "Others" && (
                    <input
                      type="text"
                      value={disposalFilters.customSubCategory}
                      onChange={(e) => handleFilterChange(setDisposalFilters)("customSubCategory", e.target.value)}
                      placeholder="Enter custom sub category"
                    />
                  )}
                </div>
                <div className="admin-asset-filter-item">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={disposalFilters.itemName}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("itemName", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Inspection Date From</label>
                  <input
                    type="date"
                    value={disposalFilters.inspectionDateFrom}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("inspectionDateFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Inspection Date To</label>
                  <input
                    type="date"
                    value={disposalFilters.inspectionDateTo}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("inspectionDateTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Condemnation Date From</label>
                  <input
                    type="date"
                    value={disposalFilters.condemnationDateFrom}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("condemnationDateFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Condemnation Date To</label>
                  <input
                    type="date"
                    value={disposalFilters.condemnationDateTo}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("condemnationDateTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Remark</label>
                  <input
                    type="text"
                    value={disposalFilters.remark}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("remark", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Purchase Value From</label>
                  <input
                    type="number"
                    value={disposalFilters.purchaseValueFrom}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("purchaseValueFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Purchase Value To</label>
                  <input
                    type="number"
                    value={disposalFilters.purchaseValueTo}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("purchaseValueTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Book Value From</label>
                  <input
                    type="number"
                    value={disposalFilters.bookValueFrom}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("bookValueFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Book Value To</label>
                  <input
                    type="number"
                    value={disposalFilters.bookValueTo}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("bookValueTo", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Disposal Value From</label>
                  <input
                    type="number"
                    value={disposalFilters.disposalValueFrom}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("disposalValueFrom", e.target.value)}
                  />
                </div>
                <div className="admin-asset-filter-item">
                  <label>Disposal Value To</label>
                  <input
                    type="number"
                    value={disposalFilters.disposalValueTo}
                    onChange={(e) => handleFilterChange(setDisposalFilters)("disposalValueTo", e.target.value)}
                  />
                </div>
                <button className="admin-asset-btn-clear" onClick={handleClearFilter}>
                  Clear Filter
                </button>
              </div>
            )}
          </div>

          {message && <p className="admin-asset-message">{message}</p>}
          {tableData.length > 0 && (
            <>
              <div style={{ marginBottom: "20px", position: "relative" }}>
                <button onClick={generatePDF} style={styles.exportButton}>
                  Export to PDF
                </button>
                <button onClick={generateExcel} style={styles.exportButton}>
                  Export to Excel
                </button>
                {(totalCost.serviceCost || totalCost.maintenanceCost || totalCost.demolitionEstimate) && (
        <div style={styles.totalCostContainer}>
          {totalCost.serviceCost && (
            <div style={{ marginBottom: totalCost.maintenanceCost || totalCost.demolitionEstimate ? "10px" : "0" }}>
              <span style={styles.totalCostLabel}>
                {activeTab === "purchase"
                  ? "Total Purchase Cost:"
                  : activeTab === "serviceReturn"
                  ? "Total Service Cost:"
                  : "Total Disposal Value:"}
              </span>
              <span style={styles.totalCostValue}>₹{totalCost.serviceCost}</span>
            </div>
          )}
          {totalCost.maintenanceCost && (
            <div style={{ marginBottom: totalCost.demolitionEstimate ? "10px" : "0" }}>
              <span style={styles.totalCostLabel}>Total Maintenance Cost:</span>
              <span style={styles.totalCostValue}>₹{totalCost.maintenanceCost}</span>
            </div>
          )}
          {totalCost.demolitionEstimate && (
            <div>
              <span style={styles.totalCostLabel}>Total Demolition Estimate:</span>
              <span style={styles.totalCostValue}>₹{totalCost.demolitionEstimate}</span>
            </div>
          )}
        </div>
      )}
              </div>
              <table className="admin-asset-table">
                <thead className="admin-asset-table-header">
                  <tr>
                    {activeTab === "purchase" && (
                      <>
                        <th>Asset Type</th>
                        <th>Asset Category</th>
                        <th>Sub Category</th>
                        <th>Item Name</th>
                        <th>Purchase Date</th>
                        <th>Quantity Received</th>
                        <th>Overall Price</th>
                        <th>Details</th>
                      </>
                    )}
                    {activeTab === "deadStock" && (
                      <>
                        <th>Article Type</th>
                        <th>Article Category</th>
                        <th>Article Sub Category</th>
                        <th>Article Name</th>
                        <th>No. of Articles Serviceable</th>
                        <th>No. of Articles Condemned</th>
                        <th>Balance</th>
                        <th>Method of Disposal</th>
                        <th>Reason for Condemnation</th>
                      </>
                    )}
                    {activeTab === "storeIssue" && storeIssueFilters.location === "store" && (
                      <>
                        <th>Asset Category</th>
                        <th>Sub Category</th>
                        <th>Item Name</th>
                        <th>Item Description</th>
                        <th>In Stock</th>
                        <th>Item IDs</th>
                      </>
                    )}
                    {activeTab === "storeIssue" && storeIssueFilters.location !== "store" && (
                      <>
                        <th>Asset Type</th>
                        <th>Asset Category</th>
                        <th>Sub Category</th>
                        <th>Item Name</th>
                        <th>Item Description</th>
                        <th>Location</th>
                        <th>Quantity Issued</th>
                        <th>Issued Date</th>
                        <th>Issued IDs</th>
                      </>
                    )}
                    {activeTab === "serviceReturn" && (
                      <>
                        <th>Asset Type</th>
                        <th>Asset Category</th>
                        <th>Sub Category</th>
                        <th>Item Name</th>
                        <th>Location</th>
                        <th>Condition</th>
                        {serviceReturnFilters.condition === "InService" ? (
                          <th>Item ID</th>
                        ) : serviceReturnFilters.condition === "Exchanged" ? (
                          <th>Returned Quantity</th>
                        ) : (
                          <>
                            <th>Item IDs</th>
                            <th>Service No</th>
                            <th>Service Date</th>
                            <th>Service Amount</th>
                          </>
                        )}
                      </>
                    )}
                    {activeTab === "disposal" && (
                      <>
                        <th>Asset Type</th>
                        <th>Asset Category</th>
                        <th>Sub Category</th>
                        <th>Item Name</th>
                        <th>Item IDs</th>
                        <th>Purchase Value</th>
                        <th>Book Value</th>
                        <th>Inspection Date</th>
                        <th>Condemnation Date</th>
                        <th>Remark</th>
                        <th>Disposal Value</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="admin-asset-table-body">
                  {tableData.map((row, index) => (
                    <tr key={index} className="admin-asset-table-row" style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      {activeTab === "purchase" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{new Date(row.purchaseDate).toLocaleDateString()}</td>
                          <td>{row.quantityReceived}</td>
                          <td>{row.overallPrice}</td>
                          <td>
                            <button onClick={() => showDetails(row)} style={styles.viewDetailsButton}>
                              View Details
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === "deadStock" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.assetSubCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{row.servicableQuantity}</td>
                          <td>{row.condemnedQuantity}</td>
                          <td>{row.overallQuantity - row.servicableQuantity - row.condemnedQuantity >= 0 ? row.overallQuantity - row.servicableQuantity - row.condemnedQuantity : 0}</td>
                          <td>{row.methodOfDisposal}</td>
                          <td>{row.remarks || "N/A"}</td>
                        </>
                      )}
                      {activeTab === "storeIssue" && storeIssueFilters.location === "store" && (
                        <>
                          <td>{row.assetCategory}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{row.itemDescription}</td>
                          <td>{row.inStock}</td>
                          <td>{row.itemIds?.join(", ") || ""}</td>
                        </>
                      )}
                      {activeTab === "storeIssue" && storeIssueFilters.location !== "store" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{row.itemDescription}</td>
                          <td>{row.location}</td>
                          <td>{row.quantityIssued}</td>
                          <td>{row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : "N/A"}</td>
                          <td>{row.issuedIds?.join(", ") || ""}</td>
                        </>
                      )}
                      {activeTab === "serviceReturn" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{row.location || "N/A"}</td>
                          <td>{row.condition}</td>
                          {serviceReturnFilters.condition === "InService" ? (
                            <td>{row.itemId || "N/A"}</td>
                          ) : serviceReturnFilters.condition === "Exchanged" ? (
                            <td>{row.returnedQuantity || "N/A"}</td>
                          ) : (
                            <>
                              <td>{(row.itemIds || []).join(", ") || "N/A"}</td>
                              <td>{row.serviceNo || "N/A"}</td>
                              <td>{row.serviceDate ? new Date(row.serviceDate).toLocaleDateString() : "N/A"}</td>
                              <td>{row.serviceAmount || "N/A"}</td>
                            </>
                          )}
                        </>
                      )}
                      {activeTab === "disposal" && (
                        <>
                          <td>{row.assetType}</td>
                          <td>{row.assetCategory}</td>
                          <td>{row.subCategory}</td>
                          <td>{row.itemName}</td>
                          <td>{row.itemIds?.join(", ") || ""}</td>
                          <td>{row.purchaseValue}</td>
                          <td>{row.bookValue}</td>
                          <td>{new Date(row.inspectionDate).toLocaleDateString()}</td>
                          <td>{new Date(row.condemnationDate).toLocaleDateString()}</td>
                          <td>{row.remark}</td>
                          <td>{row.disposalValue}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {serviceReturnFilters.assetCategory === "Building" && buildingMaintenanceData.length > 0 && (
  <>
    <h3 style={{ marginTop: "20px" }}>Building Maintenance Records</h3>
    <table className="admin-asset-table">
      <thead className="admin-asset-table-header">
        <tr>
          <th>Asset Type</th>
          <th>Asset Category</th>
          <th>Sub Category</th>
          <th>Building No</th>
          <th>Year of Maintenance</th>
          <th>Cost</th>
          <th>Description</th>
          <th>Custody</th>
          <th>Agency</th>
        </tr>
      </thead>
      <tbody className="admin-asset-table-body">
        {buildingMaintenanceData.map((row, index) => (
          <tr key={index} className="admin-asset-table-row" style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
            <td>{row.assetType}</td>
            <td>{row.assetCategory}</td>
            <td>{row.subCategory}</td>
            <td>{row.buildingNo}</td>
            <td>{new Date(row.yearOfMaintenance).toLocaleDateString()}</td>
            <td>{row.cost}</td>
            <td>{row.description}</td>
            <td>{row.custody}</td>
            <td>{row.agency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
{disposalFilters.assetCategory === "Building" && buildingCondemnationData.length > 0 && (
  <>
    <h3 style={{ marginTop: "20px" }}>Building Condemnation Records</h3>
    <table className="admin-asset-table">
      <thead className="admin-asset-table-header">
        <tr>
          <th>Asset Type</th>
          <th>Asset Category</th>
          <th>Sub Category</th>
          <th>Condemnation Year</th>
          <th>Certificate Obtained</th>
          <th>Authority</th>
          <th>Date of Reference</th>
          <th>Agency</th>
          <th>Agency Reference Number</th>
          <th>Date</th>
          <th>Demolition Period</th>
          <th>Demolition Estimate</th>
        </tr>
      </thead>
      <tbody className="admin-asset-table-body">
        {buildingCondemnationData.map((row, index) => (
          <tr key={index} className="admin-asset-table-row" style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
            <td>{row.assetType}</td>
            <td>{row.assetCategory}</td>
            <td>{row.subCategory}</td>
            <td>{row.condemnationYear}</td>
            <td>{row.certificateObtained || "N/A"}</td>
            <td>{row.authority || "N/A"}</td>
            <td>{row.dateOfReferenceUrl ? <a href={row.dateOfReferenceUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A"}</td>
            <td>{row.agency || "N/A"}</td>
            <td>{row.agencyReferenceNumberUrl ? <a href={row.agencyReferenceNumberUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A"}</td>
            <td>{row.date ? new Date(row.date).toLocaleDateString() : "N/A"}</td>
            <td>{row.demolitionPeriod || "N/A"}</td>
            <td>{row.demolitionEstimate || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
          {selectedDetails && activeTab === "purchase" && (
            <div style={styles.popupContainer}>
              <div style={styles.popupContent}>
                <h2>Asset Details</h2>
                <div style={styles.tableContainer}>
                  <table style={{ ...styles.detailsTable, ...tableStyles.detailsTable }}>
                    <tbody>
                      {[
                        { label: "Asset Type", value: selectedDetails.assetType },
                        { label: "Asset Category", value: selectedDetails.assetCategory },
                        { label: "Sub Category", value: selectedDetails.subCategory },
                        { label: "Item Name", value: selectedDetails.itemName },
                        { label: "Entry Date", value: selectedDetails.entryDate ? new Date(selectedDetails.entryDate).toLocaleDateString() : "N/A" },
                        { label: "Purchase Date", value: new Date(selectedDetails.purchaseDate).toLocaleDateString() },
                        { label: "Supplier Name", value: selectedDetails.supplierName },
                        { label: "Supplier Address", value: selectedDetails.supplierAddress || "N/A" },
                        { label: "Source", value: selectedDetails.source },
                        { label: "Mode of Purchase", value: selectedDetails.modeOfPurchase },
                        { label: "Bill No", value: selectedDetails.billNo },
                        { label: "Received By", value: selectedDetails.receivedBy },
                        { label: "Bill Photo", value: selectedDetails.billPhotoUrl ? <a href={selectedDetails.billPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                        { label: "Item Description", value: selectedDetails.itemDescription || "N/A" },
                      ].map((item, index) => (
                        <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                          <td style={{ fontWeight: "bold", width: "40%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.label}</td>
                          <td style={{ width: "60%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    <table style={tableStyles.advancedTable} className="admin-asset-table">
                    <tbody>
                      {[
                        { label: "Quantity Received", value: selectedDetails.quantityReceived },
                        { label: "Unit Price", value: selectedDetails.unitPrice },
                        { label: "Total Price", value: selectedDetails.overallPrice },
                        { label: "AMC From Date", value: selectedDetails.amcFromDate ? new Date(selectedDetails.amcFromDate).toLocaleDateString() : "N/A" },
                        { label: "AMC To Date", value: selectedDetails.amcToDate ? new Date(selectedDetails.amcToDate).toLocaleDateString() : "N/A" },
                        { label: "AMC Cost", value: selectedDetails.amcCost || "N/A" },
                        { label: "AMC Photo", value: selectedDetails.amcPhotoUrl ? <a href={selectedDetails.amcPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                        { label: "Item Photo", value: selectedDetails.itemPhotoUrl ? <a href={selectedDetails.itemPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                        { label: "Warranty Number", value: selectedDetails.warrantyNumber || "N/A" },
                        { label: "Warranty Valid Upto", value: selectedDetails.warrantyValidUpto ? new Date(selectedDetails.warrantyValidUpto).toLocaleDateString() : "N/A" },
                        { label: "Warranty Photo", value: selectedDetails.warrantyPhotoUrl ? <a href={selectedDetails.warrantyPhotoUrl} target="_blank" style={styles.linkStyle}>View</a> : "N/A" },
                        { label: "Item IDs", value: (selectedDetails.itemIds || []).length > 0 ? <span style={tableStyles.itemIdBox}>{selectedDetails.itemIds.join(", ")}</span> : "N/A" },
                        { label: "Created At", value: selectedDetails.createdAt ? new Date(selectedDetails.createdAt).toLocaleDateString() : "N/A" },
                        { label: "Updated At", value: selectedDetails.updatedAt ? new Date(selectedDetails.updatedAt).toLocaleDateString() : "N/A" },
                      ].map((item, index) => (
                        <tr key={index} style={index % 2 === 0 ? tableStyles.evenRow : tableStyles.oddRow}>
                          <td style={{ fontWeight: "bold", width: "40%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.label}</td>
                          <td style={{ width: "60%", verticalAlign: "top", padding: "10px", borderBottom: "1px solid #ddd" }}>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={styles.closeButtonContainer}>
                <button onClick={closeDetails} style={styles.closeButton}>
                  Close
                </button>
              </div>
            </div>
          )}

          {zoomedImage && (
            <div style={styles.zoomedImageContainer}>
              <img src={zoomedImage} alt="Zoomed Bill" style={styles.zoomedImage} />
              <button onClick={() => setZoomedImage(null)} style={styles.closeButton}>
                Close
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#555",
  },
  userIcon: {
    fontSize: "30px",
    color: "#007BFF",
  },
  username: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  exportButton: {
    marginRight: "10px",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  viewDetailsButton: {
    padding: "5px 10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  zoomedImageContainer: {
    position: "fixed",
    top: "60px",
    left: "250px",
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  zoomedImage: {
    maxWidth: "90%",
    maxHeight: "80%",
    objectFit: "contain",
  },
  popupContainer: {
    position: "fixed",
    top: "0px",
    left: "250px",
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Changed to slightly dim (30% opacity)
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "900px",
    maxHeight: "70%",
    overflowY: "auto",
    width: "100%", // Ensure it takes full width within maxWidth
    boxSizing: "border-box", // Include padding in width calculation
    display: "flex", // Added to stack content and button vertically
    flexDirection: "column", // Stack vertically
    alignItems: "center", // Center contents horizontally
  },
  closeButtonContainer: {
    marginTop: "20px", // Space between content and button
    textAlign: "center", // Center the button horizontally
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#ff4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  linkStyle: {
    color: "#007BFF", // Blue color for links
    textDecoration: "underline", // Optional: adds underline for better link visibility
  },
  totalCostContainer: {
    position: "absolute",
    top: "0",
    right: "0",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  totalCostLabel: {
    fontWeight: "bold",
    color: "#333",
    marginRight: "5px",
  },
  totalCostValue: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  detailsTable: {
    width: "48%", // Each table takes up roughly half the container with spacing
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  detailLabel: {
    padding: "8px",
    fontWeight: "bold",
    border: "1px solid #ddd",
    width: "40%", // Adjusted for better fit in narrower tables
  },
  detailValue: {
    padding: "8px",
    border: "1px solid #ddd",
    width: "60%",
  },
  evenRow: {
    backgroundColor: "#f2f2f2",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  tableContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px", // Space between the two tables
  },
  mainContent: {
    marginLeft: "280px", // Width of the sidebar
    padding: "20px",
  },
};

const tableStyles = {
  advancedTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  detailsTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  actionCell: {
    display: "flex",
    gap: "5px",
    justifyContent: "center",
  },
  itemIdBox: {
    border: "1px solid #007BFF",
    padding: "5px 10px",
    borderRadius: "4px",
    backgroundColor: "#f0f8ff",
    display: "inline-block",
    maxWidth: "100%",
    wordBreak: "break-word",
  },
};

export default AssetView;