
var ListItem = React.createClass({

    render:function(){

        var self=this;
        function createHeader() { return {__html: self.props.header}; };
        function createBody(){ return {__html:self.props.body}; };

        return(
        <li>
            <div className="collapsible-header" dangerouslySetInnerHTML={createHeader()}/>
            <div className="collapsible-body">
                <div className="flow-text" dangerouslySetInnerHTML={createBody()}/>
            </div>
        </li>);
    }
});

var CollapsibleList = React.createClass({
    render:function(){
        var dataCollapsible=this.props.dataCollapsible;
        if(this.props.dataCollapsible==undefined){
            dataCollapsible="accordion";
        }
        var self=this;

        var li=[];

        for (var i=0;i<this.props.list.length;i++){
            var key="listItem"+i;
            li.push(<ListItem key={key} body={self.props.list[i].body} header={self.props.list[i].header}/>)
        }
        console.log(li);

        return(
            <ul className="collapsible" data-collapsible={dataCollapsible}>
            {li}
            </ul>
        );

    }
});