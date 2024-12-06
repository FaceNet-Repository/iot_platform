package org.thingsboard.server.dao.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class RpcAssignHPC {
    private JsonNode params;
    private Boolean persistent;
    private Long timeout;

    public JsonNode getParams() {
        return params;
    }

    public void setParams(JsonNode params) {
        this.params = params;
    }

    public Boolean getPersistent() {
        return persistent;
    }

    public void setPersistent(Boolean persistent) {
        this.persistent = persistent;
    }

    public Long getTimeout() {
        return timeout;
    }

    public void setTimeout(Long timeout) {
        this.timeout = timeout;
    }
}
