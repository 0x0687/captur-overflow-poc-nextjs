// const initialPackageId = process.env.NEXT_PUBLIC_INITIAL_PACKAGE_ID;
export const currentPackageId = process.env.NEXT_PUBLIC_CURRENT_PACKAGE_ID || "";
export const tokenPackageId = process.env.NEXT_PUBLIC_TOKEN_PACKAGE_ID || "";

// === Types ====
export const COIN_TYPE = tokenPackageId + "::capt" + "::CAPT";
export const SUBMIT_BLOB_EVENT_TYPE = currentPackageId + "::captur" + "::BlobSubmittedEvent";
export const PROCESS_DATA_EVENT_TYPE = currentPackageId + "::captur" + "::DataProcessedEvent";
export const CAPTUR_ADMIN_CAP_TYPE = currentPackageId + "::captur" + "::CapturAdminCap";
export const PROCESSING_CAP_TYPE = currentPackageId + "::captur" + "::ProcessingCap";
export const SUBSCRIPTION_TYPE = currentPackageId + "::subscription" + "::Subscription";

// === Targets ===
export const SUBMIT_DATA_TARGET = currentPackageId + "::captur" + "::submit_data";
export const APPROVE_DATA_TARGET = currentPackageId + "::captur" + "::approve_data";
export const EXTEND_SUBSCRIPTION_TARGET = currentPackageId + "::captur" + "::subscribe";
export const NEW_SUBSCRIPTION_TARGET = currentPackageId + "::subscription" + "::new";
export const VERIFIER_SEAL_APPROVE_TARGET = currentPackageId + "::captur" + "::seal_approve";
export const SUBSCRIPTION_SEAL_APPROVE_TARGET = currentPackageId + "::subscription" + "::seal_approve";

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