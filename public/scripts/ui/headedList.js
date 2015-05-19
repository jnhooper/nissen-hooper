var BulletPoint = React.createClass({
    render:function(){
        return(
            <li className="flow-text">&#8226; {this.props.content}</li>
        )
    }
});

var HeadedList = React.createClass({
    render: function () {
        var points=[];
        var self = this;
        _.each(this.props.points,function(point,i){
            var point={content:point, key:self.props.firstLine+i};
            points.push(<BulletPoint {...point}/>);
        });
        return (
            <li>
                <div className="collapsible-header" style={{height:'auto'}}>
                    <h4>{this.props.firstLine}</h4>
                    <h5>{this.props.secondLine}</h5>
                    <h6>{this.props.dates}</h6>
                </div>
                <div className="collapsible-body">
                    <ul>{points}</ul>
                </div>
            </li>
        )
    }
});

