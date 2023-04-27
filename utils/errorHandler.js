class ErrorHandler extends Error {
    constructor(mes,statusCode){
        super(mes);
        this.statusCod = statusCode

        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = ErrorHandler