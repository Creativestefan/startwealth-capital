// lib/errors.ts

export class AppError extends Error {
    public statusCode: number
    
    constructor(message: string, statusCode: number = 400) {
      super(message)
      this.name = this.constructor.name
      this.statusCode = statusCode
      
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor)
      }
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message: string = "You must be logged in to access this resource") {
      super(message, 401)
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message: string = "You don't have permission to access this resource") {
      super(message, 403)
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
      super(`${resource}${id ? ` with ID ${id}` : ''} not found`, 404)
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(`Validation error: ${message}`, 400)
    }
  }
  
  export class InsufficientFundsError extends AppError {
    constructor(message: string = "Insufficient funds to complete this transaction") {
      super(message, 400)
    }
  }
  
  export class KycRequiredError extends AppError {
    public requiresKyc: boolean = true
    
    constructor(message: string = "KYC verification required to complete this action") {
      super(message, 403)
    }
  }