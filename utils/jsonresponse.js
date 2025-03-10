const respond = (res,statusCode,message,payload=null)=>{
    return res.status(statusCode).json({
        success:true,
        message,
        payload
    });
}

export default respond;