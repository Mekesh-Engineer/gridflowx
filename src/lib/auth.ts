import { User } from "firebase/auth";

export interface DecodedCustomClaims {
  role: "admin" | "supervisor" | "operator" | "auditor";
  tenantId?: string;
}

export async function getUserCustomClaims(user: User): Promise<DecodedCustomClaims> {
  try {
    const idTokenResult = await user.getIdTokenResult();
    const role = (idTokenResult.claims.role as DecodedCustomClaims["role"]) || "operator";
    return {
      role,
      tenantId: idTokenResult.claims.tenantId as string,
    };
  } catch (err) {
    console.error("Failed to parse custom claims:", err);
    return { role: "operator" };
  }
}
