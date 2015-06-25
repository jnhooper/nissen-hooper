
var CollapsibleList = React.createClass({
    render:function(){
        var dataCollapsible=this.props.dataCollapsible;
        if(this.props.dataCollapsible==undefined){
            dataCollapsible="accordion";
        }
        var self=this;
        function createHeader() { return {__html: self.props.header}; };
        function createBody(){ return {__html:self.props.body}; };

        return(
            <ul className="collapsible" data-collapsible={dataCollapsible}>
                <li>
                    <div className="collapsible-header" dangerouslySetInnerHTML={createHeader()}/>
                    <div className="collapsible-body">
                        <div className="flow-text" dangerouslySetInnerHTML={createBody()}/>
                    </div>
                </li>
            </ul>
        );

    }
});