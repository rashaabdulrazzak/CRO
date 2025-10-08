  export const getSeverity = (status: string) => {
    switch (status) {
      case "On Hold":
        return "danger";

      case "Completed":
        return "success";

      case "To do":
        return "info";

      case "in Progress":
        return "warning";

      case "renewal":
        return null;
    }
  };
  export const getTagClass = (status: string) => {
    switch (status) {
      case "On Hold":
        return "danger-tag";
      case "Completed":
        return "success-tag";
      case "to do":
        return "info-tag";
      case "in Progress":
        return "warning-tag";
      case "renewal":
        return "renewal-tag";
      default:
        return "";
    }
  };