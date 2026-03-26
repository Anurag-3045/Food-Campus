import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios';
import { toast } from 'react-toastify';
import { foodCategories } from '../../assets/assets';

const List = ({url}) => {


  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "Breakfast",
    price: "",
    description: ""
  });
  const normalizeCategory = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "maim course") return "Main Course";
    const matched = foodCategories.find((category) => category.toLowerCase() === raw);
    return matched || value;
  };

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    if(response.data.success){
      setList(response.data.data)
    }
    else{
      toast.error("Error")
    }
  }

  const removeFood = async(foodId) =>{
    const response = await axios.post(`${url}/api/food/remove`, {id:foodId})
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message)
    }
    else{
      toast.error("Error");
    }
  }

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      name: item.name || "",
      category: normalizeCategory(item.category) || "Breakfast",
      price: item.price ?? "",
      description: item.description || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      name: "",
      category: "Breakfast",
      price: "",
      description: ""
    });
  };

  const saveEdit = async (foodId) => {
    const response = await axios.post(`${url}/api/food/update`, {
      id: foodId,
      name: editData.name.trim(),
      category: editData.category,
      price: Number(editData.price),
      description: editData.description.trim()
    });

    if (response.data.success) {
      toast.success(response.data.message);
      cancelEdit();
      await fetchList();
    } else {
      toast.error(response.data.message || "Error");
    }
  };

  useEffect(()=>{
    fetchList();
  },[])

  return (
    <div className='list add flex-col'>
      <p>All FoodList</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Description</b>
          <b>Action</b>
        </div>
        {list.map((item, index)=>{
          const isEditing = editingId === item._id;
          return(
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/`+item.image} alt="" />
              {isEditing ? (
                <input
                  value={editData.name}
                  onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p>{item.name}</p>
              )}
              {isEditing ? (
                <select
                  value={editData.category}
                  onChange={(e) => setEditData((prev) => ({ ...prev, category: e.target.value }))}
                >
                  {foodCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              ) : (
                <p>{normalizeCategory(item.category)}</p>
              )}
              {isEditing ? (
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData((prev) => ({ ...prev, price: e.target.value }))}
                />
              ) : (
                <p>₹{item.price}</p>
              )}
              {isEditing ? (
                <input
                  value={editData.description}
                  onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                />
              ) : (
                <p>{item.description}</p>
              )}
              {isEditing ? (
                <div className='list-actions'>
                  <p onClick={() => saveEdit(item._id)} className='cursor'>Save</p>
                  <p onClick={cancelEdit} className='cursor'>Cancel</p>
                </div>
              ) : (
                <div className='list-actions'>
                  <p onClick={() => startEdit(item)} className='cursor'>Edit</p>
                  <p onClick={()=>removeFood(item._id)} className='cursor'>X</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default List
