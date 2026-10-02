"""
GridFlowX Domain Exceptions & Error Handling
============================================
"""

from fastapi import HTTPException, status


class SafetyViolationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ModelNotFoundError(HTTPException):
    def __init__(self, model_id: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"AI model '{model_id}' not found.")


class PermissionDeniedError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
