/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
import { UpdateAuthorDto } from './dto/update-author.dto'
import { plainToClass } from 'class-transformer'
import authorsJson from '@db/authors.json'
import { Author } from './entities/author.entity'
import Fuse from 'fuse.js'
import { GetAuthorDto } from './dto/get-author.dto'
import { paginate } from '../common/pagination/paginate'
import { GetTopAuthorsDto } from './dto/get-top-authors.dto'
import { CreateAuthorDto } from './dto/create-author.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { AuthorRepository } from './authors.repository'
import { convertToSlug } from 'src/helpers'
import { ShopSocialsRepository } from 'src/shops/shops.repository'
import { ShopSocials } from 'src/settings/entities/setting.entity'
import { Social } from 'src/users/entities/profile.entity'
import { AttachmentRepository } from 'src/common/common.repository'
import { find } from 'rxjs'



const authors = plainToClass(Author, authorsJson)

const options = {
  keys: ['name', 'slug'],
  threshold: 0.3,
}

// const fuse = new Fuse(authors, options)

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(AuthorRepository)
    private authorRepository: AuthorRepository,
    @InjectRepository(ShopSocialsRepository)
    private shopSocialsRepository: ShopSocialsRepository,
    @InjectRepository(AttachmentRepository)
    private attachmentRepository: AttachmentRepository,
    ){}


    async convertToSlug(text:any) {
      return await convertToSlug(text)
    }

   async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    try{
console.log("proper working code from create function")
      const newAuthor = new Author()
      const socials: ShopSocials[] = [];

      if (createAuthorDto.socials) {
        
        for (const social of createAuthorDto.socials) {
          const newSocial = this.shopSocialsRepository.create(social)
          const socialId = await this.shopSocialsRepository.save(newSocial)
          socials.push(socialId);
        }      
      }
      newAuthor.socials = socials
      newAuthor.id = createAuthorDto.id
      newAuthor.name = createAuthorDto.name
      newAuthor.slug = await this.convertToSlug(createAuthorDto.name);
      newAuthor.bio = createAuthorDto.bio
      newAuthor.born =  createAuthorDto.born
      newAuthor.death = createAuthorDto.death
      newAuthor.translated_languages = createAuthorDto.translated_languages
      newAuthor.languages = createAuthorDto.languages
      newAuthor.quote = createAuthorDto.quote
      newAuthor.cover_image = createAuthorDto.cover_image
      newAuthor.image = createAuthorDto.image
      newAuthor.language = createAuthorDto.language
      newAuthor.translated_languages = createAuthorDto.translated_languages
      
      const AuthorId = await this.authorRepository.save(newAuthor)

      if (AuthorId.socials) {
        const socialIds = AuthorId.socials.map((social) => social.id);
        console.log("socialIds", socialIds);
    } else {
        console.log("AuthorId socials is undefined or null");
    }
       console.log("Author", AuthorId)
       return newAuthor
    }catch(error){
      console.log("createAuthorDto", error)
    }
  }

 async getAuthors({ page, limit, search }: GetAuthorDto) {

    page = page || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data: Author[] = await this.authorRepository.find({
      relations: ['socials']
    })

    console.log("seaarch", search)
    const fuse = new Fuse(data, options)

if (search) {
  const parseSearchParams = search.split(';')
  for (const searchParam of parseSearchParams) {
    const [key, value] = searchParam.split(':')
    data = fuse.search(value)?.map(({ item }) => item)
  }
}

    const results = data.slice(startIndex, endIndex)
    console.log("results?>??????????????????????", data)

    const url = `/authors?search=${search}&limit=${limit}`
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

 async getAuthorBySlug(slug: string): Promise<Author> {
    const findAuthor = await this.authorRepository.findOne({
      where: {slug: slug},
      relations: ['socials', 'image', 'cover_image']
    })

    console.log("findAuthor+++++++++++++++++++++++", findAuthor)
    return findAuthor
  }

 async getTopAuthors({ limit = 10 }: GetTopAuthorsDto): Promise<Author[]> {
    const topAuthors = await this.authorRepository.find({
      take: limit
    })
    console.log("topAuthors_____________________", topAuthors)
    return topAuthors
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
     console.log("first", updateAuthorDto)

    // if(id && updateAuthorDto){
    //   console.log("id update working")
    //   const author = await this.authorRepository.findOne({
    //     where: { id: id },
    //     relations: ['socials', 'image', 'cover_image']
    //   })

    //   if(author){
  
    //     //  if(updateAuthorDto){ 
    //         // author.is_approved = updateAuthorDto.is_approved ?? true
    //         author.bio = updateAuthorDto.bio
    //         author.quote = updateAuthorDto.quote
    //         author.born = updateAuthorDto.born
    //         author.death = updateAuthorDto.death
    //         author.language = updateAuthorDto.language
    //         author.languages = updateAuthorDto.languages
    //         author.name = updateAuthorDto.name
    //         author.slug = await this.convertToSlug(updateAuthorDto.name);
    //         author.translated_languages = updateAuthorDto.translated_languages
  
    //              // update socials
    //              if(updateAuthorDto.socials){
  
    //               const socials: ShopSocials[] = []
  
    //               for(const updateSocial of updateAuthorDto.socials){
    //                 const existingSocial = updateAuthorDto.socials.find(
    //                   (social) => social.icon === updateSocial.icon
    //                 );
    //                 if(existingSocial){
    //                    const final = this.shopSocialsRepository.create({ ...existingSocial, ...updateSocial})
    //                    const updatedSocial = await this.shopSocialsRepository.save(final)
    //                    socials.push(updatedSocial)
    //                 } else {
    //                   const newSocial = this.shopSocialsRepository.create({ ...updateSocial})
    //                   const savedSocial = await this.shopSocialsRepository.save(newSocial)
    //                   socials.push(savedSocial)
    //                 }
    //               }
    //               author.socials = socials
    //              } else {
    //               throw new NotFoundException("Invalid action Performed");
    //              }
  
  
    //              if(updateAuthorDto.image){
  
    //               console.log("updated images")
    //               try{
    //                  const updateLogo = await this.attachmentRepository.findOne({
    //                   where: {id: author.image.id }  
    //                  })
    //                  console.log("Logoooooo", updateLogo)
    //                  if(updateLogo){
    //                   const findAttachment = await this.attachmentRepository.findOne({
    //                     where: { original: updateLogo.original }
    //                   })
    //                   console.log("Attachmentssssssssss", findAttachment)
      
    //                   const del1 = await this.attachmentRepository.delete(findAttachment)
    //                     console.log("del1", del1)
      
      
    //                    const del2 = await this.attachmentRepository.delete(updateLogo)
    //                       console.log("del2", del2)
      
    //                    const updates = this.attachmentRepository.create(updateAuthorDto.image)
    //                    const savedLogo = await this.attachmentRepository.save(updates)
    //                    console.log("saveedLogoooo**************", savedLogo)
    //                 } else {
    //                   const updates = this.attachmentRepository.create(updateAuthorDto.image)
    //                   const createLogo = await this.attachmentRepository.save(updates)
    //                   console.log("createLogoooo**************", createLogo)
    //                 }
                   
                    
    //               } catch(error) {
    //                 console.error("Error saving logo:", error);
    //                 throw new NotFoundException("Invalid action Performed");
    //               }
    //             }
  
    //           console.log("updateFirst", author)
    //        const updatedAuthor  = await this.authorRepository.save(author)
    //        return updatedAuthor
    //   }
    // } 
    // else {
        const author = await this.authorRepository.findOne({
        where: { id: id },
        relations: ['socials', 'image', 'cover_image']
      })

      console.log("author update", author, "update dto", updateAuthorDto)
      // Update author
        if(author){

            author.is_approved = updateAuthorDto.is_approved ?? true
            console.log("updateFirst", author)
              if(updateAuthorDto){ 
            // author.is_approved = updateAuthorDto.is_approved ?? true
            author.bio = updateAuthorDto.bio
            author.quote = updateAuthorDto.quote
            author.born = updateAuthorDto.born
            author.death = updateAuthorDto.death
            author.language = updateAuthorDto.language
            author.languages = updateAuthorDto.languages
            author.name = updateAuthorDto.name
            author.slug = await this.convertToSlug(updateAuthorDto.name);
            author.translated_languages = updateAuthorDto.translated_languages
          }
                  if(updateAuthorDto.socials){
  
                          const socials: ShopSocials[] = []
          
                          for(const updateSocial of updateAuthorDto.socials){
                            const existingSocial = updateAuthorDto.socials.find(
                              (social) => social.icon === updateSocial.icon
                            );
                            if(existingSocial){
                               const final = this.shopSocialsRepository.create({ ...existingSocial, ...updateSocial})
                               const updatedSocial = await this.shopSocialsRepository.save(final)
                               socials.push(updatedSocial)
                            } else {
                              const newSocial = this.shopSocialsRepository.create({ ...updateSocial})
                              const savedSocial = await this.shopSocialsRepository.save(newSocial)
                              socials.push(savedSocial)
                            }
                          }
                          author.socials = socials
                         } else {
                          throw new NotFoundException("Invalid action Performed");
                         }
                         if(updateAuthorDto.image){
  
                            console.log("updated images")
                                        try{
                                           const updateLogo = await this.attachmentRepository.findOne({
                                            where: {id: author.image.id }  
                                           })
                                           console.log("Logoooooo", updateLogo)
                                           if(updateLogo){
                                            const findAttachment = await this.attachmentRepository.findOne({
                                              where: { original: updateLogo.original }
                                            })
                                            console.log("Attachmentssssssssss", findAttachment)
                            
                                            const del1 = await this.attachmentRepository.delete(findAttachment)
                                              console.log("del1", del1)
                            
                            
                                             const del2 = await this.attachmentRepository.delete(updateLogo)
                                                console.log("del2", del2)
                            
                                             const updates = this.attachmentRepository.create(updateAuthorDto.image)
                                             const savedLogo = await this.attachmentRepository.save(updates)
                                             console.log("saveedLogoooo**************", savedLogo)
                                          } else {
                                            const updates = this.attachmentRepository.create(updateAuthorDto.image)
                                            const createLogo = await this.attachmentRepository.save(updates)
                                            console.log("createLogoooo**************", createLogo)
                                          }
                                         
                                          
                                        } catch(error) {
                                          console.error("Error saving logo:", error);
                                          throw new NotFoundException("Invalid action Performed");
                                        }
                          }
            const updatedAuthor  = await this.authorRepository.save(author)
            return updatedAuthor
      }
    // }
  
  }

 async remove(id: number) {
    console.log("number id+++++++++", id)
    const findId = await this.authorRepository.findOne({
      where: {id: id},
      relations: ['image', 'cover_image', 'socials']
    })

    if(findId){

      const del = await this.authorRepository.delete(findId.id)
      console.log("delete", del)
      if(findId.cover_image){
        const findCoverImageId = await this.attachmentRepository.findOne({
          where: { id: findId.cover_image.id }
        })
        console.log("findimage Id", findCoverImageId)
        const del1 = await this.attachmentRepository.delete(findCoverImageId)
        console.log("deleting cover image ", del1)
      }

      if(findId.image){
        const findImageId = await this.attachmentRepository.findOne({
          where: {id: findId.image.id}
        })
       console.log("image id", findImageId)
       const del2 = await this.attachmentRepository.delete(findImageId)
       console.log("deleting image ", del2)
      }
      if(findId.socials){
        for(const id of findId.socials){

          const findSocialId = await this.shopSocialsRepository.findOne({
            where: { id: id.id}
          })
          console.log("find Social Id", findSocialId)

          const del3 = await this.shopSocialsRepository.delete(findSocialId)
            console.log("deleting shop social", del3)
        }
      }

      return findId
    } else {
      const findIds = await this.shopSocialsRepository.find({
        where: {id: id}
      })
      console.log("findIds", findIds)

    }
    console.log("find Id", findId)
   
  }
}
