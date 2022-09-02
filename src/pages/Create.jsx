import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../../config";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../artifacts/contracts/Market.sol/NFTMarket.json";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";
import img from "../assets/images/img-01.jpg";
import avatar from "../assets/images/ava-01.png";
import axios from "axios";
import "../styles/create-item.css";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { useEffect, useState } from "react";

const item = {
  id: "01",
  title: "Guard",
  desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veniam adipisci cupiditate officia, nostrum et deleniti vero corrupti facilis minima laborum nesciunt nulla error natus saepe illum quasi ratione suscipit tempore dolores. Recusandae, similique modi voluptates dolore repellat eum earum sint.",
  imgUrl: img,
  creator: "Trista Francis",
  creatorImg: avatar,
  currentBid: 7.89,
};

const Create = () => {
  const [files, setFiles] = useState("");
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [isCompleted, setIsComepleted] = useState(false);
  let navigate = useNavigate();

  const createMarket = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "upload");

    try {
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dt41c7dcy/image/upload",
        data
      );

      const { url } = uploadRes.data;

      const newAsset = {
        ...formInput,
        img: url,
      };
      createSale(url);
    } catch (err) {
      console.log(err);
    }
  };

  const createSale = async (url) => {
    //create connection
    setIsComepleted(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    //create the item for sale

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    //create token it contain asset
    let transaction = await contract.createToken(url);

    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    setIsComepleted(true);
  };

  useEffect(() => {
    if (isCompleted) {
      swal({
        text: `Congratulations You Created a Digital Asset 😗`,
        buttons: ["No", "Yes"],
        icon: "warning",
      }).then(async (willUpdate) => {
        if (willUpdate) {
          navigate("/home");
        }
      });
    }
  }, [isCompleted]);
  console.log("is", isCompleted);
  return (
    <>
      <CommonSection title="Create NFT" />

      <section>
        <Container>
          <Row>
            <Col lg="3" md="4" sm="6">
              <h5 className="mb-4 text-light">Preview Item</h5>
              <NftCard item={item} file={files} formInput={formInput} />
            </Col>

            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                <form onSubmit={createMarket}>
                  <div className="form__input">
                    <label htmlFor="">Upload File</label>
                    <input
                      type="file"
                      onChange={(e) => setFiles(e.target.files)}
                      className="upload__input"
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Price</label>
                    <input
                      type="number"
                      placeholder="Enter price for one item (ETH)"
                      onChange={(e) =>
                        updateFormInput({ ...formInput, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Minimum Bid</label>
                    <input type="number" placeholder="Enter minimum bid" />
                  </div>

                  <div className=" d-flex align-items-center gap-4">
                    <div className="form__input w-50">
                      <label htmlFor="">Starting Date</label>
                      <input type="date" />
                    </div>

                    <div className="form__input w-50">
                      <label htmlFor="">Expiration Date</label>
                      <input type="date" />
                    </div>
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Title</label>
                    <input
                      type="text"
                      placeholder="Enter title"
                      onChange={(e) =>
                        updateFormInput({ ...formInput, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Description</label>
                    <textarea
                      name=""
                      id=""
                      rows="7"
                      onChange={(e) =>
                        updateFormInput({
                          ...formInput,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                      className="w-100"
                    ></textarea>
                  </div>
                  <div className="nav__right d-flex align-items-center gap-5 ">
                    <button
                      type="submit"
                      className="btn d-flex gap-2 align-items-center cursor-pointer"
                    >
                      <span>Submit</span>
                    </button>
                  </div>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Create;
