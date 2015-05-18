var BulletPoint = React.createClass({
    render:function(){
        return(
            <li  className="flow-text">- {this.props.content}</li>
        )
    }
})

var HeadedList = React.createClass({
    render: function () {
        console.log(this.props);
        var points=[];
        console.log(this);
        var self = this;
        _.each(this.props.points,function(point,i){
            var point={content:point, key:self.props.firstLine+i};
            console.log(point);
            points.push(<BulletPoint {...point}/>);
        });
        return (
            <div className="">
                <h4>{this.props.firstLine}</h4>
                <h5>{this.props.secondLine}</h5>
                <h6>{this.props.dates}</h6>
                <ul type="disc">{points}</ul>
            </div>
        )
    }
});

//React.render(
//    <HeadedList/>,
//    document.getElementById('headedList')
//);