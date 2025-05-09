// const initialPackageId = process.env.NEXT_PUBLIC_INITIAL_PACKAGE_ID;
export const currentPackageId = process.env.NEXT_PUBLIC_CURRENT_PACKAGE_ID || "";
export const tokenPackageId = process.env.NEXT_PUBLIC_TOKEN_PACKAGE_ID || "";

// === Types ====
export const COIN_TYPE = tokenPackageId + "::capt" + "::CAPT";
export const SUBMIT_BLOB_EVENT_TYPE = currentPackageId + "::captur" + "::BlobSubmittedEvent";
export const PROCESS_DATA_EVENT_TYPE = currentPackageId + "::captur" + "::DataProcessedEvent";
export const CAPTUR_ADMIN_CAP_TYPE = currentPackageId + "::captur" + "::CapturAdminCap";
export const PROCESSING_CAP_TYPE = currentPackageId + "::captur" + "::ProcessingCap";

// === Targets ===
export const SUBMIT_DATA_TARGET = currentPackageId + "::captur" + "::submit_data";
export const APPROVE_DATA_TARGET = currentPackageId + "::captur" + "::approve_data";
export const SUBSCRIBE_TARGET = currentPackageId + "::captur" + "::subscribe";

// === Move Functions ===
export const SUBMIT_DATA_FUNCTION = {
    package: currentPackageId,
    module: "captur",
    function: "submit_data",
}
export const APPROVE_DATA_FUNCTION = {
    package: currentPackageId,
    module: "captur",
    function: "approve_data",
}