class resHandler{
    constructor(success, message, data = null){
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static success(message, data = null){
        return new resHandler(true, message, data);
    }
    static error(message, data = null){
        return new resHandler(false, message, data);
    }
    
    toJSON(){
        const rawData = this.data?.data || this?.data;
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            page: this.data?.page,
            limit: this.data?.limit,
            total: this.data?.total
        }
    }
}

module.exports = resHandler;